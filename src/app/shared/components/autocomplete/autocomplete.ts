import { Component, computed, ElementRef, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

let nextId = 0;

@Component({
  selector: 'app-autocomplete',
  imports: [Icon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Autocomplete), multi: true },
  ],
  host: { class: 'relative block', '(focusout)': 'onFocusOut($event)' },
  template: `
    <div class="relative">
      <input
        #field
        class="field-input pr-8 text-left"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        [id]="inputId()"
        [value]="value()"
        [disabled]="isDisabled()"
        [placeholder]="placeholder()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
        (input)="onInput(field.value)"
        (focus)="open()"
        (click)="open()"
        (keydown)="onKeydown($event)"
      />
      <button
        class="absolute inset-y-0 right-0 cursor-pointer px-1 text-gray-600 hover:text-gray-900"
        type="button"
        tabindex="-1"
        aria-label="Show all options"
        [disabled]="isDisabled()"
        (mousedown)="$event.preventDefault()"
        (click)="toggle(field)"
      >
        <app-icon class="size-5" name="list" />
      </button>
    </div>

    @if (isOpen() && filteredOptions().length) {
      <ul
        class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        role="listbox"
        [id]="listId"
      >
        @for (option of filteredOptions(); track option; let i = $index) {
          <li
            class="cursor-pointer px-3 py-1.5 text-sm text-gray-800"
            role="option"
            [id]="optionId(i)"
            [class.bg-blue-50]="i === activeIndex()"
            [attr.aria-selected]="i === activeIndex()"
            (mousedown)="$event.preventDefault()"
            (click)="select(option)"
          >
            {{ option }}
          </li>
        }
      </ul>
    }
  `,
})
export class Autocomplete implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input.required<readonly string[]>();
  readonly inputId = input<string>();
  readonly placeholder = input('');

  protected readonly listId = `autocomplete-list-${nextId++}`;
  protected readonly value = signal('');
  protected readonly isOpen = signal(false);
  protected readonly isDisabled = signal(false);
  protected readonly activeIndex = signal(-1);

  protected readonly filteredOptions = computed(() => {
    const search = this.value().trim().toLowerCase();
    return this.options().filter((option) => option.toLowerCase().includes(search));
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected optionId(index: number): string {
    return `${this.listId}-${index}`;
  }

  protected open(): void {
    this.isOpen.set(true);
  }

  protected toggle(field: HTMLInputElement): void {
    this.isOpen.update((isOpen) => !isOpen);
    field.focus();
  }

  protected onInput(value: string): void {
    this.updateValue(value);
    this.isOpen.set(true);
    this.activeIndex.set(this.filteredOptions().length ? 0 : -1);
  }

  protected select(option: string): void {
    this.updateValue(option);
    this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const lastIndex = this.filteredOptions().length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        this.activeIndex.update((index) => Math.min(index + 1, lastIndex));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((index) => Math.max(index - 1, 0));
        break;
      case 'Enter':
        if (this.isOpen() && this.activeIndex() >= 0) {
          event.preventDefault();
          this.select(this.filteredOptions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  // Typing "mango" is accepted as "Mango" once the user leaves the field.
  protected onFocusOut(event: FocusEvent): void {
    if (this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      return;
    }

    const match = this.options().find(
      (option) => option.toLowerCase() === this.value().trim().toLowerCase(),
    );
    if (match && match !== this.value()) {
      this.updateValue(match);
    }

    this.close();
    this.onTouched();
  }

  private updateValue(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  private close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }
}
