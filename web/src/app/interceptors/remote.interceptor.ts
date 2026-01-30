import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError, EMPTY, tap } from 'rxjs';
import { RemoteConfigService } from '../services/remote-config.service';
import { InterceptorConfig, InterceptorConfigModification } from '../app.component.types';
import { BusEvent, EVENT_BUS_PUSHER } from 'typlib';
import { dd } from '../utilites/dd';

@Injectable()
export class RemoteInterceptor implements HttpInterceptor {
  
  constructor(
    private remoteConfigService: RemoteConfigService,
    @Inject(EVENT_BUS_PUSHER) private eventBusPusher: any
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const interceptorConfigs = this.remoteConfigService.getInterceptors();
    const requestConfigs: InterceptorConfig[] = interceptorConfigs.filter(el => this._isRequestConfig(req, el));
    
    let modifiedReq = req.clone();
    
    if (requestConfigs.length) {
      requestConfigs.forEach(config => {
        config.data?.forEach((mod: InterceptorConfigModification) => {
          let addedValue: string | null = '';
          
          switch (mod.valueHandler.source) {
            case 'localStorage':
              addedValue = localStorage.getItem(mod.valueHandler.prop);
              break;
            case 'window':
              addedValue = this._getNestedWindowProperty(mod.valueHandler.prop);
              break;
            default:
              addedValue = 'TODO';
          }
        
          if (mod.valueHandler.prepend) {
            addedValue = `${mod.valueHandler.prepend}${addedValue}`;
          }

          switch (mod.target) {
            case 'headers':
              modifiedReq = modifiedReq.clone({
                headers: modifiedReq.headers.set(mod.key, String(addedValue))
              });
              break;
            case 'body':
              if (!modifiedReq.body) {
                throw new Error('Cannot modify body - request has no body');
              }
              modifiedReq = modifiedReq.clone({
                body: { ...modifiedReq.body, [mod.key]: addedValue }
              });  
              break;
            default:  
              console.log("something's wrong in the neighborhood");
          }
        });
      });
    }

    return next.handle(modifiedReq).pipe(
      tap((res: any) => {
        if (res instanceof HttpResponse) {
          const responseConfigs: InterceptorConfig[] = interceptorConfigs
            .filter(el => this._isResponseConfig(req, el));

          if (responseConfigs.length) {
            responseConfigs.forEach(config => {
              if (config.push) {
                if (config.push.type === 'TRIGGER_ACTION') {
                  if (config.push.action) {
                    let payload = {};
                    if (config.push.static_payload) {
                      payload = config.push.static_payload
                    }
                    if (config.push.include_request) {
                      // dd(req)
                      // dd(res)
                      payload = { 
                        ...payload,
                        request: {
                          url: req.url,
                          payload: (req.method === 'POST') 
                            ? req.body 
                            : 'not post method'
                        }
                      }
                    }
                    if (config.push.include_response) {
                      payload = { 
                        ...payload,
                        response: {
                          code: res.status,
                          body: res.body
                        }
                      }
                    }
                    const busEvent: BusEvent = {
                      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
                      to: config.project_id!,
                      event: config.push.action,
                      payload: payload,
                    };
                    this.eventBusPusher(busEvent);
                  }
                }
              }
            });
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const errorConfigs: InterceptorConfig[] = interceptorConfigs.filter(el => this._isErrorConfig(error, el));

        if (errorConfigs.length) {
          errorConfigs.forEach(el => {
            this._onErrorAction(el);  
          });
          
          return EMPTY;
        }
        return throwError(() => error);
      })
    );
  }

  private _isRequestConfig(req: HttpRequest<unknown>, config: InterceptorConfig): boolean {
    if (config.on === 'REQUEST') {
      const url = req.url;
      const exp = config.url_pattern;
      const cleanExp = exp?.replace(/^\/|\/$/g, '');
      
      if (!cleanExp) {
        return false;
      }
      
      const isMatchedUrl = new RegExp(cleanExp).test(url);  
      return !config.url_pattern || isMatchedUrl;
    }
    return false;
  }

  private _isResponseConfig(req: HttpRequest<unknown>, config: InterceptorConfig): boolean {
    if (config.on === 'RESPONSE') {
      const url = req.url;
      const exp = config.url_pattern;
      const cleanExp = exp?.replace(/^\/|\/$/g, '');
      
      if (!cleanExp) {
        return false;
      }
      
      const isMatchedUrl = new RegExp(cleanExp).test(url);  
      return !config.url_pattern || isMatchedUrl;
    }
    return false;
  }

  private _isErrorConfig(error: HttpErrorResponse, config: InterceptorConfig): boolean {
    if (config.on === 'ERROR') {
      if (config.trigger === error.status) {
        return true;
      }
    }
    return false;
  }

  private _onErrorAction(config: InterceptorConfig): void {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      event: config.action!,
      payload: { routerPath: config.project_id },
    };
    console.log('ERROR interceptor is triggering ' + config.action + ' ACTION');
    this.eventBusPusher(busEvent);
  }

  private _getNestedWindowProperty(path: string): any {
    const parts = path.split('.');
    let current: any = window;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(`Property '${part}' not found in path '${path}'`);
      }
      current = current[part];
    }
    
    return current;
  }
}