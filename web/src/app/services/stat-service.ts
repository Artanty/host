import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatService {
    constructor(private http: HttpClient) {}

    sendStatData(payload: any): void {
      this.http.post<any>(`${process.env['STAT_BACK_URL']}/add-event`, payload).subscribe(res=> {
        console.log('stat sent')
      })
    }

    test() {
      const data = {
        "userId": 1,
        "folderId": null,
        "topicId": 2,
        "ticketId": null,
        "dateFrom": "2023-10-01",
        "dateTo": "2023-10-31",
        "frequency": 60,
        "weekdays": "1001001",
        "active": true
      }
      this.http.post<any>(`${process.env['STAT_BACK_URL']}/schedule/create`, data).subscribe(res=> {
        console.log(res)
      })
    }
}
