---
title: "Spring AI使用ollamaModel和qwen3兼容问题because evalDuration is null错误解决"
date: "2025-08-01"
excerpt: "Spring AI使用ollamaModel和qwen3兼容问题because evalDuration is null错误解决详细办法"
image: "https://r2.haydenbi.com/cover/post/springai-qwen.png"
tags: ["Spring AI", "Java", "后端", "AI"]
author: "Hayden Bi"
---

### 问题描述

**JDK 版本: 17**
**Spring AI 版本: 1.0.0**
**库: OllamaChatModel**
**模型:qwen3**
**使用 maven 库**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-ollama</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.30</version>
</dependency>
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>33.0.0-jre</version>
</dependency>

<!-- https://mvnrepository.com/artifact/com.baomidou/mybatis-plus-spring-boot3-starter -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.12</version>
</dependency>
```

使用 Spring AI 框架调用 OllamaChatModel 方法时配置 qwen3 模型时会出现 Cannot invoke "java.time.Duration.plus(java.time.Duration)" because "evalDuration" is null 错误。错误原因是 OllamaChatModel 源码中的判断问题。官方将在 1.0.x 后续版本中解决。那么下面将在 1.0 版本中手动解决该问题

参考官方回复:https://github.com/spring-projects/spring-ai/issues/3369
https://github.com/spring-projects/spring-ai/pull/3372

出现问题的源码如下图
![Spring AI OllamaChatModel源码中的evalDuration空指针问题](https://r2.haydenbi.com/post/SpringAI-ollama-nullPointExpection.jpeg)

### 解决方法

这个时候我们要重写 OllamaChatModel，重写的方式就是新建一个 OllamaAlibabaChatModel 类。如下代码

```java
package com.bi.demoai.model;

import com.fasterxml.jackson.core.type.TypeReference;
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import io.micrometer.observation.contextpropagation.ObservationThreadLocalAccessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.ToolResponseMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.metadata.ChatGenerationMetadata;
import org.springframework.ai.chat.metadata.ChatResponseMetadata;
import org.springframework.ai.chat.metadata.DefaultUsage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.model.MessageAggregator;
import org.springframework.ai.chat.observation.ChatModelObservationContext;
import org.springframework.ai.chat.observation.ChatModelObservationConvention;
import org.springframework.ai.chat.observation.ChatModelObservationDocumentation;
import org.springframework.ai.chat.observation.DefaultChatModelObservationConvention;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.ModelOptionsUtils;
import org.springframework.ai.model.tool.*;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaModel;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.ai.ollama.api.common.OllamaApiConstants;
import org.springframework.ai.ollama.management.ModelManagementOptions;
import org.springframework.ai.ollama.management.OllamaModelManager;
import org.springframework.ai.ollama.management.PullModelStrategy;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.ai.util.json.JsonParser;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * @author: Bi
 * @date: 2025/6/2
 */
public class OllamaAlibabaChatModel implements ChatModel {
    private static final Logger logger = LoggerFactory.getLogger(OllamaAlibabaChatModel.class);

    private static final String DONE = "done";

    private static final String METADATA_PROMPT_EVAL_COUNT = "prompt-eval-count";

    private static final String METADATA_EVAL_COUNT = "eval-count";

    private static final String METADATA_CREATED_AT = "created-at";

    private static final String METADATA_TOTAL_DURATION = "total-duration";

    private static final String METADATA_LOAD_DURATION = "load-duration";

    private static final String METADATA_PROMPT_EVAL_DURATION = "prompt-eval-duration";

    private static final String METADATA_EVAL_DURATION = "eval-duration";

    private static final ChatModelObservationConvention DEFAULT_OBSERVATION_CONVENTION = new DefaultChatModelObservationConvention();

    private static final ToolCallingManager DEFAULT_TOOL_CALLING_MANAGER = ToolCallingManager.builder().build();

    private final OllamaApi chatApi;

    private final OllamaOptions defaultOptions;

    private final ObservationRegistry observationRegistry;

    private final OllamaModelManager modelManager;

    private final ToolCallingManager toolCallingManager;

    /**
     * The tool execution eligibility predicate used to determine if a tool can be
     * executed.
     */
    private final ToolExecutionEligibilityPredicate toolExecutionEligibilityPredicate;

    private ChatModelObservationConvention observationConvention = DEFAULT_OBSERVATION_CONVENTION;

    public OllamaAlibabaChatModel(OllamaApi ollamaApi, OllamaOptions defaultOptions, ToolCallingManager toolCallingManager,
                           ObservationRegistry observationRegistry, ModelManagementOptions modelManagementOptions) {
        this(ollamaApi, defaultOptions, toolCallingManager, observationRegistry, modelManagementOptions,
                new DefaultToolExecutionEligibilityPredicate());
    }

    public OllamaAlibabaChatModel(OllamaApi ollamaApi, OllamaOptions defaultOptions, ToolCallingManager toolCallingManager,
                           ObservationRegistry observationRegistry, ModelManagementOptions modelManagementOptions,
                           ToolExecutionEligibilityPredicate toolExecutionEligibilityPredicate) {
        Assert.notNull(ollamaApi, "ollamaApi must not be null");
        Assert.notNull(defaultOptions, "defaultOptions must not be null");
        Assert.notNull(toolCallingManager, "toolCallingManager must not be null");
        Assert.notNull(observationRegistry, "observationRegistry must not be null");
        Assert.notNull(modelManagementOptions, "modelManagementOptions must not be null");
        Assert.notNull(toolExecutionEligibilityPredicate, "toolExecutionEligibilityPredicate must not be null");
        this.chatApi = ollamaApi;
        this.defaultOptions = defaultOptions;
        this.toolCallingManager = toolCallingManager;
        this.observationRegistry = observationRegistry;
        this.modelManager = new OllamaModelManager(this.chatApi, modelManagementOptions);
        this.toolExecutionEligibilityPredicate = toolExecutionEligibilityPredicate;
        initializeModel(defaultOptions.getModel(), modelManagementOptions.pullModelStrategy());
    }

    public static OllamaAlibabaChatModel.Builder builder() {
        return new OllamaAlibabaChatModel.Builder();
    }

    static ChatResponseMetadata from(OllamaApi.ChatResponse response, ChatResponse previousChatResponse) {
        Assert.notNull(response, "OllamaApi.ChatResponse must not be null");

        DefaultUsage newUsage = getDefaultUsage(response);
        Integer promptTokens = newUsage.getPromptTokens();
        Integer generationTokens = newUsage.getCompletionTokens();
        int totalTokens = newUsage.getTotalTokens();

        Duration evalDuration = response.getEvalDuration();
        Duration promptEvalDuration = response.getPromptEvalDuration();
        Duration loadDuration = response.getLoadDuration();
        Duration totalDuration = response.getTotalDuration();

        if (previousChatResponse != null && previousChatResponse.getMetadata() != null) {
            Object metadataEvalDuration = previousChatResponse.getMetadata().get(METADATA_EVAL_DURATION);
            if (metadataEvalDuration != null && evalDuration != null) {
                evalDuration = evalDuration.plus((Duration) metadataEvalDuration);
            }
            Object metadataPromptEvalDuration = previousChatResponse.getMetadata().get(METADATA_PROMPT_EVAL_DURATION);
            if (metadataPromptEvalDuration != null && promptEvalDuration != null) {
                promptEvalDuration = promptEvalDuration.plus((Duration) metadataPromptEvalDuration);
            }
            Object metadataLoadDuration = previousChatResponse.getMetadata().get(METADATA_LOAD_DURATION);
            if (metadataLoadDuration != null && loadDuration != null) {
                loadDuration = loadDuration.plus((Duration) metadataLoadDuration);
            }
            Object metadataTotalDuration = previousChatResponse.getMetadata().get(METADATA_TOTAL_DURATION);
            if (metadataTotalDuration != null && totalDuration != null) {
                totalDuration = totalDuration.plus((Duration) metadataTotalDuration);
            }
            if (previousChatResponse.getMetadata().getUsage() != null) {
                promptTokens += previousChatResponse.getMetadata().getUsage().getPromptTokens();
                generationTokens += previousChatResponse.getMetadata().getUsage().getCompletionTokens();
                totalTokens += previousChatResponse.getMetadata().getUsage().getTotalTokens();
            }
        }

        DefaultUsage aggregatedUsage = new DefaultUsage(promptTokens, generationTokens, totalTokens);

        return ChatResponseMetadata.builder()
                .usage(aggregatedUsage)
                .model(response.model())
                .keyValue(METADATA_CREATED_AT, response.createdAt())
                .keyValue(METADATA_EVAL_DURATION, evalDuration)
                .keyValue(METADATA_EVAL_COUNT, aggregatedUsage.getCompletionTokens().intValue())
                .keyValue(METADATA_LOAD_DURATION, loadDuration)
                .keyValue(METADATA_PROMPT_EVAL_DURATION, promptEvalDuration)
                .keyValue(METADATA_PROMPT_EVAL_COUNT, aggregatedUsage.getPromptTokens().intValue())
                .keyValue(METADATA_TOTAL_DURATION, totalDuration)
                .keyValue(DONE, response.done())
                .build();
    }

    private static DefaultUsage getDefaultUsage(OllamaApi.ChatResponse response) {
        return new DefaultUsage(Optional.ofNullable(response.promptEvalCount()).orElse(0),
                Optional.ofNullable(response.evalCount()).orElse(0));
    }

    @Override
    public ChatResponse call(Prompt prompt) {
        // Before moving any further, build the final request Prompt,
        // merging runtime and default options.
        Prompt requestPrompt = buildRequestPrompt(prompt);
        return this.internalCall(requestPrompt, null);
    }

    private ChatResponse internalCall(Prompt prompt, ChatResponse previousChatResponse) {

        OllamaApi.ChatRequest request = ollamaChatRequest(prompt, false);

        ChatModelObservationContext observationContext = ChatModelObservationContext.builder()
                .prompt(prompt)
                .provider(OllamaApiConstants.PROVIDER_NAME)
                .build();

        ChatResponse response = ChatModelObservationDocumentation.CHAT_MODEL_OPERATION
                .observation(this.observationConvention, DEFAULT_OBSERVATION_CONVENTION, () -> observationContext,
                        this.observationRegistry)
                .observe(() -> {

                    OllamaApi.ChatResponse ollamaResponse = this.chatApi.chat(request);

                    List<AssistantMessage.ToolCall> toolCalls = ollamaResponse.message().toolCalls() == null ? List.of()
                            : ollamaResponse.message()
                            .toolCalls()
                            .stream()
                            .map(toolCall -> new AssistantMessage.ToolCall("", "function", toolCall.function().name(),
                                    ModelOptionsUtils.toJsonString(toolCall.function().arguments())))
                            .toList();

                    var assistantMessage = new AssistantMessage(ollamaResponse.message().content(), Map.of(), toolCalls);

                    ChatGenerationMetadata generationMetadata = ChatGenerationMetadata.NULL;
                    if (ollamaResponse.promptEvalCount() != null && ollamaResponse.evalCount() != null) {
                        generationMetadata = ChatGenerationMetadata.builder()
                                .finishReason(ollamaResponse.doneReason())
                                .build();
                    }

                    var generator = new Generation(assistantMessage, generationMetadata);
                    ChatResponse chatResponse = new ChatResponse(List.of(generator),
                            from(ollamaResponse, previousChatResponse));

                    observationContext.setResponse(chatResponse);

                    return chatResponse;

                });

        if (this.toolExecutionEligibilityPredicate.isToolExecutionRequired(prompt.getOptions(), response)) {
            var toolExecutionResult = this.toolCallingManager.executeToolCalls(prompt, response);
            if (toolExecutionResult.returnDirect()) {
                // Return tool execution result directly to the client.
                return ChatResponse.builder()
                        .from(response)
                        .generations(ToolExecutionResult.buildGenerations(toolExecutionResult))
                        .build();
            }
            else {
                // Send the tool execution result back to the model.
                return this.internalCall(new Prompt(toolExecutionResult.conversationHistory(), prompt.getOptions()),
                        response);
            }
        }

        return response;
    }

    @Override
    public Flux<ChatResponse> stream(Prompt prompt) {
        // Before moving any further, build the final request Prompt,
        // merging runtime and default options.
        Prompt requestPrompt = buildRequestPrompt(prompt);
        return this.internalStream(requestPrompt, null);
    }

    private Flux<ChatResponse> internalStream(Prompt prompt, ChatResponse previousChatResponse) {
        return Flux.deferContextual(contextView -> {
            OllamaApi.ChatRequest request = ollamaChatRequest(prompt, true);

            final ChatModelObservationContext observationContext = ChatModelObservationContext.builder()
                    .prompt(prompt)
                    .provider(OllamaApiConstants.PROVIDER_NAME)
                    .build();

            Observation observation = ChatModelObservationDocumentation.CHAT_MODEL_OPERATION.observation(
                    this.observationConvention, DEFAULT_OBSERVATION_CONVENTION, () -> observationContext,
                    this.observationRegistry);

            observation.parentObservation(contextView.getOrDefault(ObservationThreadLocalAccessor.KEY, null)).start();

            Flux<OllamaApi.ChatResponse> ollamaResponse = this.chatApi.streamingChat(request);

            Flux<ChatResponse> chatResponse = ollamaResponse.map(chunk -> {
                String content = (chunk.message() != null) ? chunk.message().content() : "";

                List<AssistantMessage.ToolCall> toolCalls = List.of();

                // Added null checks to prevent NPE when accessing tool calls
                if (chunk.message() != null && chunk.message().toolCalls() != null) {
                    toolCalls = chunk.message()
                            .toolCalls()
                            .stream()
                            .map(toolCall -> new AssistantMessage.ToolCall("", "function", toolCall.function().name(),
                                    ModelOptionsUtils.toJsonString(toolCall.function().arguments())))
                            .toList();
                }

                var assistantMessage = new AssistantMessage(content, Map.of(), toolCalls);

                ChatGenerationMetadata generationMetadata = ChatGenerationMetadata.NULL;
                if (chunk.promptEvalCount() != null && chunk.evalCount() != null) {
                    generationMetadata = ChatGenerationMetadata.builder().finishReason(chunk.doneReason()).build();
                }

                var generator = new Generation(assistantMessage, generationMetadata);
                return new ChatResponse(List.of(generator), from(chunk, previousChatResponse));
            });

            // @formatter:off
            Flux<ChatResponse> chatResponseFlux = chatResponse.flatMap(response -> {
                        if (this.toolExecutionEligibilityPredicate.isToolExecutionRequired(prompt.getOptions(), response)) {
                            // FIXME: bounded elastic needs to be used since tool calling
                            //  is currently only synchronous
                            return Flux.defer(() -> {
                                var toolExecutionResult = this.toolCallingManager.executeToolCalls(prompt, response);
                                if (toolExecutionResult.returnDirect()) {
                                    // Return tool execution result directly to the client.
                                    return Flux.just(ChatResponse.builder().from(response)
                                            .generations(ToolExecutionResult.buildGenerations(toolExecutionResult))
                                            .build());
                                }
                                else {
                                    // Send the tool execution result back to the model.
                                    return this.internalStream(new Prompt(toolExecutionResult.conversationHistory(), prompt.getOptions()),
                                            response);
                                }
                            }).subscribeOn(Schedulers.boundedElastic());
                        }
                        else {
                            return Flux.just(response);
                        }
                    })
                    .doOnError(observation::error)
                    .doFinally(s ->
                            observation.stop()
                    )
                    .contextWrite(ctx -> ctx.put(ObservationThreadLocalAccessor.KEY, observation));
            // @formatter:on

            return new MessageAggregator().aggregate(chatResponseFlux, observationContext::setResponse);
        });
    }

    Prompt buildRequestPrompt(Prompt prompt) {
        // Process runtime options
        OllamaOptions runtimeOptions = null;
        if (prompt.getOptions() != null) {
            if (prompt.getOptions() instanceof ToolCallingChatOptions toolCallingChatOptions) {
                runtimeOptions = ModelOptionsUtils.copyToTarget(toolCallingChatOptions, ToolCallingChatOptions.class,
                        OllamaOptions.class);
            }
            else {
                runtimeOptions = ModelOptionsUtils.copyToTarget(prompt.getOptions(), ChatOptions.class,
                        OllamaOptions.class);
            }
        }

        // Define request options by merging runtime options and default options
        OllamaOptions requestOptions = ModelOptionsUtils.merge(runtimeOptions, this.defaultOptions,
                OllamaOptions.class);
        // Merge @JsonIgnore-annotated options explicitly since they are ignored by
        // Jackson, used by ModelOptionsUtils.
        if (runtimeOptions != null) {
            requestOptions.setInternalToolExecutionEnabled(
                    ModelOptionsUtils.mergeOption(runtimeOptions.getInternalToolExecutionEnabled(),
                            this.defaultOptions.getInternalToolExecutionEnabled()));
            requestOptions.setToolNames(ToolCallingChatOptions.mergeToolNames(runtimeOptions.getToolNames(),
                    this.defaultOptions.getToolNames()));
            requestOptions.setToolCallbacks(ToolCallingChatOptions.mergeToolCallbacks(runtimeOptions.getToolCallbacks(),
                    this.defaultOptions.getToolCallbacks()));
            requestOptions.setToolContext(ToolCallingChatOptions.mergeToolContext(runtimeOptions.getToolContext(),
                    this.defaultOptions.getToolContext()));
        }
        else {
            requestOptions.setInternalToolExecutionEnabled(this.defaultOptions.getInternalToolExecutionEnabled());
            requestOptions.setToolNames(this.defaultOptions.getToolNames());
            requestOptions.setToolCallbacks(this.defaultOptions.getToolCallbacks());
            requestOptions.setToolContext(this.defaultOptions.getToolContext());
        }

        // Validate request options
        if (!StringUtils.hasText(requestOptions.getModel())) {
            throw new IllegalArgumentException("model cannot be null or empty");
        }

        ToolCallingChatOptions.validateToolCallbacks(requestOptions.getToolCallbacks());

        return new Prompt(prompt.getInstructions(), requestOptions);
    }

    /**
     * Package access for testing.
     */
    OllamaApi.ChatRequest ollamaChatRequest(Prompt prompt, boolean stream) {

        List<OllamaApi.Message> ollamaMessages = prompt.getInstructions().stream().map(message -> {
            if (message instanceof UserMessage userMessage) {
                var messageBuilder = OllamaApi.Message.builder(OllamaApi.Message.Role.USER).content(message.getText());
                if (!CollectionUtils.isEmpty(userMessage.getMedia())) {
                    messageBuilder.images(
                            userMessage.getMedia().stream().map(media -> this.fromMediaData(media.getData())).toList());
                }
                return List.of(messageBuilder.build());
            }
            else if (message instanceof SystemMessage systemMessage) {
                return List.of(OllamaApi.Message.builder(OllamaApi.Message.Role.SYSTEM).content(systemMessage.getText()).build());
            }
            else if (message instanceof AssistantMessage assistantMessage) {
                List<OllamaApi.Message.ToolCall> toolCalls = null;
                if (!CollectionUtils.isEmpty(assistantMessage.getToolCalls())) {
                    toolCalls = assistantMessage.getToolCalls().stream().map(toolCall -> {
                        var function = new OllamaApi.Message.ToolCallFunction(toolCall.name(),
                                JsonParser.fromJson(toolCall.arguments(), new TypeReference<>() {
                                }));
                        return new OllamaApi.Message.ToolCall(function);
                    }).toList();
                }
                return List.of(OllamaApi.Message.builder(OllamaApi.Message.Role.ASSISTANT)
                        .content(assistantMessage.getText())
                        .toolCalls(toolCalls)
                        .build());
            }
            else if (message instanceof ToolResponseMessage toolMessage) {
                return toolMessage.getResponses()
                        .stream()
                        .map(tr -> OllamaApi.Message.builder(OllamaApi.Message.Role.TOOL).content(tr.responseData()).build())
                        .toList();
            }
            throw new IllegalArgumentException("Unsupported message type: " + message.getMessageType());
        }).flatMap(List::stream).toList();

        OllamaOptions requestOptions = (OllamaOptions) prompt.getOptions();

        OllamaApi.ChatRequest.Builder requestBuilder = OllamaApi.ChatRequest.builder(requestOptions.getModel())
                .stream(stream)
                .messages(ollamaMessages)
                .options(requestOptions);

        if (requestOptions.getFormat() != null) {
            requestBuilder.format(requestOptions.getFormat());
        }

        if (requestOptions.getKeepAlive() != null) {
            requestBuilder.keepAlive(requestOptions.getKeepAlive());
        }

        List<ToolDefinition> toolDefinitions = this.toolCallingManager.resolveToolDefinitions(requestOptions);
        if (!CollectionUtils.isEmpty(toolDefinitions)) {
            requestBuilder.tools(this.getTools(toolDefinitions));
        }

        return requestBuilder.build();
    }

    private String fromMediaData(Object mediaData) {
        if (mediaData instanceof byte[] bytes) {
            return Base64.getEncoder().encodeToString(bytes);
        }
        else if (mediaData instanceof String text) {
            return text;
        }
        else {
            throw new IllegalArgumentException("Unsupported media data type: " + mediaData.getClass().getSimpleName());
        }

    }

    private List<OllamaApi.ChatRequest.Tool> getTools(List<ToolDefinition> toolDefinitions) {
        return toolDefinitions.stream().map(toolDefinition -> {
            var tool = new OllamaApi.ChatRequest.Tool.Function(toolDefinition.name(), toolDefinition.description(),
                    toolDefinition.inputSchema());
            return new OllamaApi.ChatRequest.Tool(tool);
        }).toList();
    }

    @Override
    public ChatOptions getDefaultOptions() {
        return OllamaOptions.fromOptions(this.defaultOptions);
    }

    /**
     * Pull the given model into Ollama based on the specified strategy.
     */
    private void initializeModel(String model, PullModelStrategy pullModelStrategy) {
        if (pullModelStrategy != null && !PullModelStrategy.NEVER.equals(pullModelStrategy)) {
            this.modelManager.pullModel(model, pullModelStrategy);
        }
    }

    /**
     * Use the provided convention for reporting observation data
     * @param observationConvention The provided convention
     */
    public void setObservationConvention(ChatModelObservationConvention observationConvention) {
        Assert.notNull(observationConvention, "observationConvention cannot be null");
        this.observationConvention = observationConvention;
    }

    public static final class Builder {

        private OllamaApi ollamaApi;

        private OllamaOptions defaultOptions = OllamaOptions.builder().model(OllamaModel.MISTRAL.id()).build();

        private ToolCallingManager toolCallingManager;

        private ToolExecutionEligibilityPredicate toolExecutionEligibilityPredicate = new DefaultToolExecutionEligibilityPredicate();

        private ObservationRegistry observationRegistry = ObservationRegistry.NOOP;

        private ModelManagementOptions modelManagementOptions = ModelManagementOptions.defaults();

        private Builder() {
        }

        public OllamaAlibabaChatModel.Builder ollamaApi(OllamaApi ollamaApi) {
            this.ollamaApi = ollamaApi;
            return this;
        }

        public OllamaAlibabaChatModel.Builder defaultOptions(OllamaOptions defaultOptions) {
            this.defaultOptions = defaultOptions;
            return this;
        }

        public OllamaAlibabaChatModel.Builder toolCallingManager(ToolCallingManager toolCallingManager) {
            this.toolCallingManager = toolCallingManager;
            return this;
        }

        public OllamaAlibabaChatModel.Builder toolExecutionEligibilityPredicate(
                ToolExecutionEligibilityPredicate toolExecutionEligibilityPredicate) {
            this.toolExecutionEligibilityPredicate = toolExecutionEligibilityPredicate;
            return this;
        }

        public OllamaAlibabaChatModel.Builder observationRegistry(ObservationRegistry observationRegistry) {
            this.observationRegistry = observationRegistry;
            return this;
        }

        public OllamaAlibabaChatModel.Builder modelManagementOptions(ModelManagementOptions modelManagementOptions) {
            this.modelManagementOptions = modelManagementOptions;
            return this;
        }

        public OllamaAlibabaChatModel build() {
            if (this.toolCallingManager != null) {
                return new OllamaAlibabaChatModel(this.ollamaApi, this.defaultOptions, this.toolCallingManager,
                        this.observationRegistry, this.modelManagementOptions, this.toolExecutionEligibilityPredicate);
            }
            return new OllamaAlibabaChatModel(this.ollamaApi, this.defaultOptions, DEFAULT_TOOL_CALLING_MANAGER,
                    this.observationRegistry, this.modelManagementOptions, this.toolExecutionEligibilityPredicate);
        }

    }
}
```

上面这段代码其实大部分是把 OllamaChatModel 的类复制过来，只修改了关键部分
![修改后的OllamaAlibabaChatModel关键代码部分](https://r2.haydenbi.com/post/SpringAI-ollama-nullPointExpection.jpeg)
把图片中 if 语句中的代码替换成如下代码即可

```java
if (previousChatResponse != null && previousChatResponse.getMetadata() != null) {
            Object metadataEvalDuration = previousChatResponse.getMetadata().get(METADATA_EVAL_DURATION);
            if (metadataEvalDuration != null && evalDuration != null) {
                evalDuration = evalDuration.plus((Duration) metadataEvalDuration);
            }
            Object metadataPromptEvalDuration = previousChatResponse.getMetadata().get(METADATA_PROMPT_EVAL_DURATION);
            if (metadataPromptEvalDuration != null && promptEvalDuration != null) {
                promptEvalDuration = promptEvalDuration.plus((Duration) metadataPromptEvalDuration);
            }
            Object metadataLoadDuration = previousChatResponse.getMetadata().get(METADATA_LOAD_DURATION);
            if (metadataLoadDuration != null && loadDuration != null) {
                loadDuration = loadDuration.plus((Duration) metadataLoadDuration);
            }
            Object metadataTotalDuration = previousChatResponse.getMetadata().get(METADATA_TOTAL_DURATION);
            if (metadataTotalDuration != null && totalDuration != null) {
                totalDuration = totalDuration.plus((Duration) metadataTotalDuration);
            }
            if (previousChatResponse.getMetadata().getUsage() != null) {
                promptTokens += previousChatResponse.getMetadata().getUsage().getPromptTokens();
                generationTokens += previousChatResponse.getMetadata().getUsage().getCompletionTokens();
                totalTokens += previousChatResponse.getMetadata().getUsage().getTotalTokens();
            }
        }
```

下一步把新建的 OllamaAlibabaChatModel 类注册成为 Bean。具体注册方式参考下面代码，AiConfiguration.ollamaAlibabaChatModel 方法

```java
package com.bi.demoai.config;

import com.bi.demoai.constants.SystemConstants;
import com.bi.demoai.model.OllamaAlibabaChatModel;
import com.bi.demoai.tools.CourseTools;
import io.micrometer.observation.ObservationRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.observation.ChatModelObservationConvention;
import org.springframework.ai.model.ollama.autoconfigure.OllamaChatProperties;
import org.springframework.ai.model.ollama.autoconfigure.OllamaInitializationProperties;
import org.springframework.ai.model.tool.DefaultToolExecutionEligibilityPredicate;
import org.springframework.ai.model.tool.ToolCallingManager;
import org.springframework.ai.model.tool.ToolExecutionEligibilityPredicate;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.management.ModelManagementOptions;
import org.springframework.ai.ollama.management.PullModelStrategy;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Objects;

/**
 * ai相关配置类
 * @author: Bi
 * @date: 2025/5/10
 */
@Configuration
@RequiredArgsConstructor
public class AiConfiguration {

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.builder()
                .maxMessages(10)
                .build();
    }

    /**
     * 自定义兼容阿里巴巴模型
     * @param ollamaApi ollamaApi
     * @param properties properties
     * @param initProperties initProperties
     * @param toolCallingManager toolCallingManager
     * @param observationRegistry observationRegistry
     * @param observationConvention observationConvention
     * @param ollamaToolExecutionEligibilityPredicate ollamaToolExecutionEligibilityPredicate
     * @return OllamaAlibabaChatModel
     */
    @Bean
    public OllamaAlibabaChatModel ollamaAlibabaChatModel(OllamaApi ollamaApi, OllamaChatProperties properties, OllamaInitializationProperties initProperties, ToolCallingManager toolCallingManager, ObjectProvider<ObservationRegistry> observationRegistry, ObjectProvider<ChatModelObservationConvention> observationConvention, ObjectProvider<ToolExecutionEligibilityPredicate> ollamaToolExecutionEligibilityPredicate) {
        PullModelStrategy chatModelPullStrategy = initProperties.getChat().isInclude() ? initProperties.getPullModelStrategy() : PullModelStrategy.NEVER;
        OllamaAlibabaChatModel chatModel = OllamaAlibabaChatModel.builder().ollamaApi(ollamaApi).defaultOptions(properties.getOptions()).toolCallingManager(toolCallingManager).toolExecutionEligibilityPredicate((ToolExecutionEligibilityPredicate)ollamaToolExecutionEligibilityPredicate.getIfUnique(DefaultToolExecutionEligibilityPredicate::new)).observationRegistry((ObservationRegistry)observationRegistry.getIfUnique(() -> {
            return ObservationRegistry.NOOP;
        })).modelManagementOptions(new ModelManagementOptions(chatModelPullStrategy, initProperties.getChat().getAdditionalModels(), initProperties.getTimeout(), initProperties.getMaxRetries())).build();
        Objects.requireNonNull(chatModel);
        observationConvention.ifAvailable(chatModel::setObservationConvention);
        return chatModel;
    }
}

```

这么一来我们就可以用自己的 OllamaAlibabaChatModel 类来代替 OllamaChatModel 使用阿里的 qwen3 模型了
具体使用方法
serviceChatClient 为自己定义的方法，形参中把 OllamaChatModel 替换为 OllamaAlibabaChatModel 模型即可。

```java
/**
     * 构建模型客户端
     * @param ollamaChatModel ollama聊天模型
     * @return ChatClient
     */
    @Bean
    public ChatClient serviceChatClient(OllamaAlibabaChatModel ollamaChatModel, ChatMemory chatMemory, CourseTools courseTools) {
        return ChatClient.builder(ollamaChatModel)
                .defaultSystem(SystemConstants.SERVICE_SYSTEM_PROMPT)
                .defaultAdvisors(
                        SimpleLoggerAdvisor.builder().build(), // 日志
                        MessageChatMemoryAdvisor.builder(chatMemory).build() // 配置会话记忆 chat-memory advisor
                )
                .defaultTools(courseTools)
                .build();
    }
```

通过以上配置即可解决 Cannot invoke "java.time.Duration.plus(java.time.Duration)" because "evalDuration" is null 错误

如果以上解决方法有其他问题可以通过邮件联系我
