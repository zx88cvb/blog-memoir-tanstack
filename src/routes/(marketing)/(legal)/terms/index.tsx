import { createFileRoute } from '@tanstack/react-router'
import { staticPageRouteOptions } from '../-static-page';

export const Route = createFileRoute('/(marketing)/(legal)/terms/')(
  staticPageRouteOptions('terms')
);