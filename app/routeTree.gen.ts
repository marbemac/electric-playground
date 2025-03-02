/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DocumentsLayoutImport } from './routes/documents/layout'
import { Route as IndexImport } from './routes/index'
import { Route as DocumentsIndexImport } from './routes/documents/index'
import { Route as DocumentsDocumentIdIndexImport } from './routes/documents/$documentId/index'

// Create/Update Routes

const DocumentsLayoutRoute = DocumentsLayoutImport.update({
  id: '/documents',
  path: '/documents',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const DocumentsIndexRoute = DocumentsIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => DocumentsLayoutRoute,
} as any)

const DocumentsDocumentIdIndexRoute = DocumentsDocumentIdIndexImport.update({
  id: '/$documentId/',
  path: '/$documentId/',
  getParentRoute: () => DocumentsLayoutRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/documents': {
      id: '/documents'
      path: '/documents'
      fullPath: '/documents'
      preLoaderRoute: typeof DocumentsLayoutImport
      parentRoute: typeof rootRoute
    }
    '/documents/': {
      id: '/documents/'
      path: '/'
      fullPath: '/documents/'
      preLoaderRoute: typeof DocumentsIndexImport
      parentRoute: typeof DocumentsLayoutImport
    }
    '/documents/$documentId/': {
      id: '/documents/$documentId/'
      path: '/$documentId'
      fullPath: '/documents/$documentId'
      preLoaderRoute: typeof DocumentsDocumentIdIndexImport
      parentRoute: typeof DocumentsLayoutImport
    }
  }
}

// Create and export the route tree

interface DocumentsLayoutRouteChildren {
  DocumentsIndexRoute: typeof DocumentsIndexRoute
  DocumentsDocumentIdIndexRoute: typeof DocumentsDocumentIdIndexRoute
}

const DocumentsLayoutRouteChildren: DocumentsLayoutRouteChildren = {
  DocumentsIndexRoute: DocumentsIndexRoute,
  DocumentsDocumentIdIndexRoute: DocumentsDocumentIdIndexRoute,
}

const DocumentsLayoutRouteWithChildren = DocumentsLayoutRoute._addFileChildren(
  DocumentsLayoutRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/documents': typeof DocumentsLayoutRouteWithChildren
  '/documents/': typeof DocumentsIndexRoute
  '/documents/$documentId': typeof DocumentsDocumentIdIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/documents': typeof DocumentsIndexRoute
  '/documents/$documentId': typeof DocumentsDocumentIdIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/documents': typeof DocumentsLayoutRouteWithChildren
  '/documents/': typeof DocumentsIndexRoute
  '/documents/$documentId/': typeof DocumentsDocumentIdIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/documents' | '/documents/' | '/documents/$documentId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/documents' | '/documents/$documentId'
  id:
    | '__root__'
    | '/'
    | '/documents'
    | '/documents/'
    | '/documents/$documentId/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DocumentsLayoutRoute: typeof DocumentsLayoutRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DocumentsLayoutRoute: DocumentsLayoutRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/documents"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/documents": {
      "filePath": "documents/layout.tsx",
      "children": [
        "/documents/",
        "/documents/$documentId/"
      ]
    },
    "/documents/": {
      "filePath": "documents/index.tsx",
      "parent": "/documents"
    },
    "/documents/$documentId/": {
      "filePath": "documents/$documentId/index.tsx",
      "parent": "/documents"
    }
  }
}
ROUTE_MANIFEST_END */
