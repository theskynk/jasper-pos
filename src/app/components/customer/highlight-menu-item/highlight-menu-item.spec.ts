import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightMenuItem } from './highlight-menu-item';

describe('HighlightMenuItem', () => {
  let component: HighlightMenuItem;
  let fixture: ComponentFixture<HighlightMenuItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightMenuItem],
    }).compileComponents();

    fixture = TestBed.createComponent(HighlightMenuItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
