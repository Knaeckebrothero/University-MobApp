import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingSystemComponent } from './operating-system.component';

describe('OperatingSystemComponent', () => {
  let component: OperatingSystemComponent;
  let fixture: ComponentFixture<OperatingSystemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperatingSystemComponent]
    });
    fixture = TestBed.createComponent(OperatingSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
