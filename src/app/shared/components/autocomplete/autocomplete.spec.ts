import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Autocomplete } from './autocomplete';

@Component({
  imports: [Autocomplete, ReactiveFormsModule],
  template: `
    <app-autocomplete
      inputId="fruit"
      [options]="['Mango', 'Apple', 'Banana']"
      [formControl]="control"
    />
    <button id="outside">Outside</button>
  `,
})
class Host {
  readonly control = new FormControl('');
}

describe('Autocomplete', () => {
  let fixture: ComponentFixture<Host>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    input = fixture.nativeElement.querySelector('#fruit');
  });

  function options(): string[] {
    return [...fixture.nativeElement.querySelectorAll('[role="option"]')].map(
      (option: HTMLElement) => option.textContent!.trim(),
    );
  }

  async function type(value: string): Promise<void> {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function press(key: string): Promise<void> {
    input.dispatchEvent(new KeyboardEvent('keydown', { key }));
    await fixture.whenStable();
  }

  it('filters the options while typing', async () => {
    await type('an');

    expect(options()).toEqual(['Mango', 'Banana']);
    expect(fixture.componentInstance.control.value).toBe('an');
  });

  it('selects an option on click and closes the list', async () => {
    await type('ap');
    fixture.nativeElement.querySelector('[role="option"]').click();
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('Apple');
    expect(options()).toEqual([]);
  });

  it('supports choosing with the arrow keys and Enter', async () => {
    await type('a');
    await press('ArrowDown');
    await press('Enter');

    expect(fixture.componentInstance.control.value).toBe('Apple');
  });

  it('corrects the letter case when leaving the field', async () => {
    await type('banana');
    input.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: fixture.nativeElement.querySelector('#outside'),
      }),
    );
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('Banana');
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
