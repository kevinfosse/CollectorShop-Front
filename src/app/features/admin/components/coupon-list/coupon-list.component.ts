import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CouponService } from '../../../../core/services/coupon.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  CouponDto,
  CouponType,
  CouponTypeLabels,
  CreateCouponRequest,
  UpdateCouponRequest,
} from '../../../../core/models';

@Component({
  selector: 'app-admin-coupon-list',
  imports: [ReactiveFormsModule, DatePipe, TranslateModule],
  templateUrl: './coupon-list.component.html',
  styleUrl: './coupon-list.component.scss',
})
export class CouponListComponent implements OnInit {
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly coupons = signal<CouponDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly couponTypes = Object.values(CouponType).filter(
    (v) => typeof v === 'number',
  ) as CouponType[];
  protected readonly typeLabels = CouponTypeLabels;
  protected readonly CouponType = CouponType;

  protected readonly couponForm = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    description: [''],
    type: [CouponType.Percentage],
    value: [0, [Validators.required, Validators.min(0)]],
    minimumOrderAmount: [null as number | null],
    maximumDiscountAmount: [null as number | null],
    usageLimit: [null as number | null],
    usageLimitPerCustomer: [null as number | null],
    startsAt: [''],
    expiresAt: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadCoupons();
  }

  protected loadCoupons(): void {
    this.loading.set(true);
    this.couponService.getCoupons().subscribe({
      next: (coupons) => {
        this.coupons.set(coupons);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load coupons', 'error');
        this.loading.set(false);
      },
    });
  }

  protected onAdd(): void {
    this.editingId.set(null);
    this.couponForm.reset({ type: CouponType.Percentage, value: 0, isActive: true });
    this.couponForm.get('code')?.enable();
    this.couponForm.get('type')?.enable();
    this.couponForm.get('value')?.enable();
    this.showForm.set(true);
  }

  protected onEdit(coupon: CouponDto): void {
    this.editingId.set(coupon.id);
    this.couponForm.patchValue({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderAmount: coupon.minimumOrderAmount ?? null,
      maximumDiscountAmount: coupon.maximumDiscountAmount ?? null,
      usageLimit: coupon.usageLimit ?? null,
      usageLimitPerCustomer: coupon.usageLimitPerCustomer ?? null,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    });
    // In edit mode, code/type/value are not updatable per backend DTO
    this.couponForm.get('code')?.disable();
    this.couponForm.get('type')?.disable();
    this.couponForm.get('value')?.disable();
    this.showForm.set(true);
  }

  protected onCancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  protected onSubmit(): void {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.couponForm.getRawValue();
    const editId = this.editingId();

    if (editId) {
      const request: UpdateCouponRequest = {
        description: formValue.description ?? '',
        usageLimit: formValue.usageLimit ?? undefined,
        usageLimitPerCustomer: formValue.usageLimitPerCustomer ?? undefined,
        startsAt: formValue.startsAt ? new Date(formValue.startsAt) : undefined,
        expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined,
        isActive: formValue.isActive!,
      };

      this.couponService.updateCoupon(editId, request).subscribe({
        next: () => {
          this.toastService.show('Coupon updated', 'success');
          this.saving.set(false);
          this.showForm.set(false);
          this.editingId.set(null);
          this.loadCoupons();
        },
        error: () => {
          this.toastService.show('Failed to update coupon', 'error');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreateCouponRequest = {
        code: formValue.code!,
        description: formValue.description ?? '',
        type: formValue.type!,
        value: formValue.value!,
        minimumOrderAmount: formValue.minimumOrderAmount ?? undefined,
        maximumDiscountAmount: formValue.maximumDiscountAmount ?? undefined,
        usageLimit: formValue.usageLimit ?? undefined,
        usageLimitPerCustomer: formValue.usageLimitPerCustomer ?? undefined,
        startsAt: formValue.startsAt ? new Date(formValue.startsAt) : undefined,
        expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt) : undefined,
      };

      this.couponService.createCoupon(request).subscribe({
        next: () => {
          this.toastService.show('Coupon created', 'success');
          this.saving.set(false);
          this.showForm.set(false);
          this.loadCoupons();
        },
        error: () => {
          this.toastService.show('Failed to create coupon', 'error');
          this.saving.set(false);
        },
      });
    }
  }

  protected onDelete(coupon: CouponDto): void {
    if (confirm(`Delete coupon "${coupon.code}"?`)) {
      this.couponService.deleteCoupon(coupon.id).subscribe({
        next: () => {
          this.toastService.show('Coupon deleted', 'success');
          this.loadCoupons();
        },
        error: () => this.toastService.show('Failed to delete coupon', 'error'),
      });
    }
  }

  protected getValueDisplay(coupon: CouponDto): string {
    if (coupon.type === CouponType.Percentage) {
      return `${coupon.value}%`;
    }
    return `€${coupon.value.toFixed(2)}`;
  }
}
