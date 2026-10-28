---
title: "Docker中overlay2磁盘占用爆满清理方案"
date: "2025-12-05"
excerpt: "Docker中overlay2磁盘占用爆满清理方案,检查磁盘空间和各容器占用空间"
image: "https://r2.haydenbi.com/cover/post/docker-overlay2-clean.png"
tags: ["Docker", "Linux", "部署"]
author: "Hayden Bi"
---

## 检查磁盘空间和各容器占用空间
### 检查磁盘空间情况
首先检查磁盘空间确认overlay2占用空间

```bash
df -h
```

可以看到以下结果

```bash
Filesystem      Size  Used Avail Use% Mounted on
udev            7.9G     0  7.9G   0% /dev
tmpfs           1.6G  2.1M  1.6G   1% /run
/dev/sda1       197G   59G  131G  32% /
tmpfs           7.9G     0  7.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda15      124M   12M  113M  10% /boot/efi
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/3ea43957615f592f2a7b28512fd7f344ac762bfc80a4a964ac467b17f562203e/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/bd8702eb9dcc24aff1a54387374f6609b431aabb1c7131359296867986dc84a0/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/b6b66bb24dc1186c12f18ddb3487a3b81ef40767993a722b08359808635461bd/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/0bf724bd62f24f7411c573b03fef2816c0b14a696ce04e8b78c4616b704b1b86/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/d7caeb11110a19f032d90855ae491c9cb35c5cbbd57daf266e5b12c3494ba21e/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/e4ec25032cb6814980100348c68e937bb4b9e48c098dbf99c5a543428f73e8b7/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/53277c320141d4efa122ad91fe38fe9e7362d29d2cdabb5c3d8c2a1bdea12120/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/b5b65a3ebe16e33091590dbdbea7c51b6ffc8ab894358d9cb7d95934a14a8579/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/864d8e14ba8c74bc627a35847aff844e45acc43686abc7d81c471969fe2b8386/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/5d0d903a3ccd4b5b2cd6741d4eb9654b10667fd5707c13d3d51f2678b5c4d7a2/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/4c2bf66ffcd7f2a8bb03dcee3f5d445c4be9c56b899aaea319689a92193fbaf4/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/3a9e03fd9038307f133da2800527610a6334e458d42d8a406ea30e108dd8ec58/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/4c509ec79872340afca9c9a763782005fa043f5e4c988acc9f24f371d7c79b5c/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/d9bad19c0ce3f9ff18364ee882e52bb9fef3db1c5a99bdbfb97fe4dbbea6f985/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/492549dc47bc8b55a73c945ad3eb699fe34c5e563d22cf4b16383048420fbffe/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/31a7a2393fa100d485b852cda049e4efe7e2d57240a638bde911901a9878e6bd/merged
overlay         197G   59G  131G  32% /var/lib/docker/overlay2/c56e33e03da1a8e849eb8d02a660cfdbf1b21774a99adb8bb1435e072ead0eaf/merged
tmpfs           1.6G     0  1.6G   0% /run/user/0

```



如果看到overlay Use%这一栏占用百分比过高说明确实是overlay目录占用过高导致服务器磁盘空间过小的问题



### 检查容器的占用情况
首先检查docker模块中的占用情况

```bash
docker system df
```

结果显示

```bash
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          20        18        8.739GB   684.5MB (7%)
Containers      18        17        11.12MB   6.23kB (0%)
Local Volumes   7         6         348.8MB   72.39MB (20%)
Build Cache     754       0         40.38GB   40.38GB

```



+ Images: 镜像的数量及占用大小
+ Containers: 容器的数量及占用大小
+ Local Volumes: 本地卷数量及占用大小
+ Build Cache: 打包构建时的缓存大小



我们主要是清理Images、Containers和Build Cache中的文件

## 执行清理操作
### 清理无用的Images
首先先查看一下目前存在的镜像

```bash
docker images
```

结果

```bash
REPOSITORY                                     TAG       IMAGE ID       CREATED        SIZE
<none>                                         <none>    defd79220cd6   2 months ago   239MB
```

可以看到有很多到`<none>`字样的镜像。这里我只截取一个作为参考。发现数量和占用大小都挺多的。

none镜像被官方称为**dangling镜像。**代表没有标签且没有被使用过的镜像,可以安全放心的清理。

清理方法也很简单,执行下面命令

```bash
docker image prune
```

这条命令会自动帮我们清除带有`<none>`的无效镜像。命令执行完毕会提示释放了多少个空间。然后我们再来执行docker images命令会发现带有`<none>`的镜像全部被清理干净了磁盘空间也得到了释放!

### 清理Containers容器中的日志
Containers容器占用最多的基本上就是日志文件

Docker 日志(也就是 docker logs 输出的东西) 默认存放在：

```bash
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

这个日志文件可能会越积越大，需要定期清理。



方法1: 

先找到日志文件路径：

```bash
docker inspect <容器名或ID> --format='{{.LogPath}}'
```

然后清空它

```bash
truncate -s 0 "$(docker inspect <容器名或ID> --format='{{.LogPath}}')"
```



方法2: 还有另一种方式可以一次性清理所有容器

```bash
find /var/lib/docker/containers/ -name "*-json.log" -exec truncate -s 0 {} \;
```

**不删除文件、不重启服务，不影响任何容器运行。**

#### 从根源限制Docker日志大小(一劳永逸的方法 推荐)
我们可以设置限制日志大小从而不用每次都来手动删除日志

输入

```bash
vim /etc/docker/daemon.json
```

然后再文件中写入

```bash
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

这样每个容器最多只会占用30MB的日志空间。

写入完成后并不会立刻生效，需要重启运行中的容器。

如果有条件的情况下重启docker会对所有容器都生效

```bash
systemctl restart docker
```

### 清理Build Cache构建缓存
Build Cache主要是构建时的缓存，清理它们下次打包构建时速度可能会慢点，对于系统没有任何影响。如果磁盘占用过高需要及时清理。清理方法也特别简单就一行命令

```bash
docker builder prune
```

执行完成后可以发现服务器的内存又释放了一大截。

## 总结
通过先查看磁盘占用、再清理无用镜像与日志、最后删除构建缓存，可以快速释放overlay2占用的磁盘空间。如果希望长期稳定，建议同时配置日志大小限制，并定期用`docker system df`和`df -h`复查空间，避免再次爆满。
