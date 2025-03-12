import { Router, Routes } from "@angular/router";
import { Remotes } from "../app.component";

export function isRoutePresent(router: Router, path: string): boolean {
    // Recursively search through the router configuration
    const searchRoutes = (routes: Routes): boolean => {
      for (const route of routes) {
        if (route.path === path) {
          return true; // Route found
        }
  
        // Check child routes (if any)
        if (route.children && searchRoutes(route.children)) {
          return true;
        }
      }
      return false; // Route not found
    };
  
    return searchRoutes(router.config);
  }


  export function getUrlPath (): string {
    const fullUrl = window.location.href; // Get the full URL from the browser
    const url = new URL(fullUrl);
    const path = url.pathname; // Extracts the path (e.g., "/faq/ticket-create")

    // console.log(path); // Output: /faq/ticket-create
    return path
  }

  export function isProductRoute(remotes: Remotes, projectId: string): boolean {
    const rootProjectUrl = remotes[projectId].routerPath
    return getUrlPath().split('/').filter(Boolean)[0] === rootProjectUrl
  }
  