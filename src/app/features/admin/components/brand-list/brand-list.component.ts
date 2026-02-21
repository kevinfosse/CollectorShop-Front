import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BrandService } from '../../../../core/services/brand.service';
import { ToastService } from '../../../../core/services/toast.service';
import { BrandDto, CreateBrandRequest, UpdateBrandRequest } from '../../../../core/models';

@Component({
  selector: 'app-admin-brand-list',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss',
})
export class BrandListComponent implements OnInit {
  private readonly brandService = inject(BrandService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly brands = signal<BrandDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly brandForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    slug: ['', [Validators.required, Validators.maxLength(100)]],
    logoUrl: [''],
    websiteUrl: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadBrands();
  }

  protected loadBrands(): void {
    this.loading.set(true);
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load brands', 'error');
        this.loading.set(false);
      },
    });
  }

  protected onAdd(): void {
    this.editingId.set(null);
    this.brandForm.reset({ isActive: true });
    this.showForm.set(true);
  }

  protected onEdit(brand: BrandDto): void {
    this.editingId.set(brand.id);
    this.brandForm.patchValue({
      name: brand.name,
      description: brand.description,
      slug: brand.slug,
      logoUrl: brand.logoUrl ?? '',
      websiteUrl: brand.websiteUrl ?? '',
      isActive: brand.isActive,
    });
    this.showForm.set(true);
  }

  protected onCancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  protected onSubmit(): void {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.brandForm.value;
    const editId = this.editingId();

    if (editId) {
      const request: UpdateBrandRequest = {
        name: formValue.name!,
        description: formValue.description ?? '',
        slug: formValue.slug!,
        logoUrl: formValue.logoUrl || undefined,
        websiteUrl: formValue.websiteUrl || undefined,
        isActive: formValue.isActive!,
      };

      this.brandService.updateBrand(editId, request).subscribe({
        next: () => {
          this.toastService.show('Brand updated', 'success');
          this.saving.set(false);
          this.showForm.set(false);
          this.editingId.set(null);
          this.loadBrands();
        },
        error: () => {
          this.toastService.show('Failed to update brand', 'error');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreateBrandRequest = {
        name: formValue.name!,
        description: formValue.description ?? '',
        slug: formValue.slug!,
        logoUrl: formValue.logoUrl || undefined,
        websiteUrl: formValue.websiteUrl || undefined,
      };

      this.brandService.createBrand(request).subscribe({
        next: () => {
          this.toastService.show('Brand created', 'success');
          this.saving.set(false);
          this.showForm.set(false);
          this.loadBrands();
        },
        error: () => {
          this.toastService.show('Failed to create brand', 'error');
          this.saving.set(false);
        },
      });
    }
  }

  protected onDelete(brand: BrandDto): void {
    if (confirm(`Delete "${brand.name}"?`)) {
      this.brandService.deleteBrand(brand.id).subscribe({
        next: () => {
          this.toastService.show('Brand deleted', 'success');
          this.loadBrands();
        },
        error: () => this.toastService.show('Failed to delete brand', 'error'),
      });
    }
  }

  protected generateSlug(): void {
    const name = this.brandForm.get('name')?.value;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      this.brandForm.patchValue({ slug });
    }
  }
}
