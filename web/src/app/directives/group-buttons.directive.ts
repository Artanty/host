import { Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appGroupButtons]',
})
export class GroupButtonsDirective implements AfterViewInit, OnDestroy {
  private trigger$ = new Subject<void>(); // Trigger subject
  private destroy$ = new Subject<void>(); // For unsubscribing
  
  constructor(
    private el: ElementRef, private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    this.trigger$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.groupElements());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public triggerGrouping() {
    this.trigger$.next();
  }

  private groupElements() {
    const container = this.el.nativeElement;

    // Remove existing group wrappers (if any)
    const existingWrappers = Array.from(container.querySelectorAll('[data-group_wrapper]'));
    existingWrappers.forEach((wrapper: any) => {
      Array.from(wrapper.children).forEach((child) => {
        this.renderer.appendChild(container, child); // Move children back to the container
      });
      this.renderer.removeChild(container, wrapper); // Remove the wrapper
    });

    // Find all elements with the 'data-group' attribute (recursively)
    const elementsWithGroup = this.findAllElementsWithGroup(container);

    // Group elements by their 'data-group' attribute
    const groups = new Map<string, { elements: HTMLElement[]; mainOrder: number }>();

    elementsWithGroup.forEach((element) => {
      const group = element.getAttribute('data-group');
      if (group) {
        if (!groups.has(group)) {
          // Extract the 'data-main_order' attribute for the group
          const mainOrder = parseInt(element.getAttribute('data-main_order') || '0', 10);
          groups.set(group, { elements: [], mainOrder });
        }
        groups.get(group)!.elements.push(element);
      }
    });

    // Convert the map to an array and sort groups by 'data-main_order'
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      return a[1].mainOrder - b[1].mainOrder;
    });

    // Wrap each group in a div, sort the elements within the group, and append to the container
    sortedGroups.forEach(([groupName, { elements, mainOrder }]) => {
      const wrapper = this.renderer.createElement('div');
      this.renderer.setAttribute(wrapper, 'data-group_wrapper', groupName);
      this.renderer.addClass(wrapper, 'group')
      // Sort elements within the group by 'data-order_in_group'
      elements.sort((a, b) => {
        const orderA = parseInt(a.getAttribute('data-order_in_group') || '0', 10);
        const orderB = parseInt(b.getAttribute('data-order_in_group') || '0', 10);
        return orderA - orderB;
      });

      // Add sorted elements to the wrapper
      elements.forEach((element) => {
        this.renderer.removeChild(element.parentElement, element); // Remove from original parent
        this.renderer.appendChild(wrapper, element); // Add to wrapper
      });

      this.renderer.appendChild(container, wrapper); // Add wrapper to container
    });
  }

  /**
   * Recursively find all elements with the 'data-group' attribute.
   */
  private findAllElementsWithGroup(element: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = [];

    // Check if the current element has the 'data-group' attribute
    if (element.hasAttribute('data-group')) {
      elements.push(element);
    }

    // Recursively check children
    Array.from(element.children).forEach((child) => {
      elements.push(...this.findAllElementsWithGroup(child as HTMLElement));
    });

    return elements;
  }
}