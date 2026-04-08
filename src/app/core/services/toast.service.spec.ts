import { TestBed } from '@angular/core/testing';
import { ToastService, ToastType } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty toasts list', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should add a toast with correct properties when show() is called', () => {
    service.show('Operation successful', 'success');

    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Operation successful');
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].icon).toBe('pi pi-check-circle');
  });

  it('should assign the correct icon for each toast type', () => {
    const typeIconPairs: [ToastType, string][] = [
      ['success', 'pi pi-check-circle'],
      ['error', 'pi pi-times-circle'],
      ['info', 'pi pi-info-circle'],
      ['warning', 'pi pi-exclamation-triangle'],
    ];

    typeIconPairs.forEach(([type, expectedIcon]) => {
      service.show('msg', type);
      const last = service.toasts().at(-1)!;
      expect(last.icon).toBe(expectedIcon);
    });
  });

  it('should dismiss a specific toast by id', () => {
    service.show('First', 'info');
    service.show('Second', 'error');
    expect(service.toasts().length).toBe(2);

    const firstId = service.toasts()[0].id;
    service.dismiss(firstId);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Second');
  });

  it('should auto-dismiss toast after the specified duration', () => {
    vi.useFakeTimers();

    service.show('Temporary message', 'warning', 1000);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1000);

    expect(service.toasts().length).toBe(0);

    vi.useRealTimers();
  });

  it('should support multiple concurrent toasts', () => {
    service.show('Toast 1', 'success');
    service.show('Toast 2', 'error');
    service.show('Toast 3', 'info');

    expect(service.toasts().length).toBe(3);
  });
});
