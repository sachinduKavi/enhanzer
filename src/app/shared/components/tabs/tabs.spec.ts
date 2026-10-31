import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tabs } from './tabs';

@Component({
  imports: [Tabs],
  template: `<app-tabs [tabs]="['One', 'Two']" [(active)]="active" />`,
})
class Host {
  readonly active = signal('One');
}

describe('Tabs', () => {
  it('marks the active tab and updates the bound value on click', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [one, two] = fixture.nativeElement.querySelectorAll('button') as HTMLButtonElement[];

    expect(one.getAttribute('aria-selected')).toBe('true');

    two.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.active()).toBe('Two');
    expect(two.getAttribute('aria-selected')).toBe('true');
    expect(one.getAttribute('aria-selected')).toBe('false');
  });
});
