import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  public visibleName = ''
  @Input() set name (data: string) {
    this.visibleName = this._getAbbreviation(data)
  }
  
  @Input() title: string = ''
  @Input() imgSrcBaseUrl: string = ''
  @Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };
  @Input() routerPath: string = ''
  @Input() state: string = ''
  
  @Output() buttonClick = new EventEmitter<string>();
  
  public onButtonClick() {
    this.buttonClick.emit('')
  }

  private _getAbbreviation(input: string) {
    // Split the input string into words
    const words = input.trim().split(/\s+/);
  
    // If there's only one word, take the first 4 symbols
    if (words.length === 1) {
      return words[0].substring(0, 4);
    }
  
    // If there are 2 or more words, take the first symbol of the first 2 words
    if (words.length >= 2) {
      return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    }
  
    // Return an empty string if the input is empty
    return "";
  }
  
}
