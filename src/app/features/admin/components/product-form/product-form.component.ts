import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { BrandService } from '../../../../core/services/brand.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  ProductDto,
  CategoryListDto,
  BrandDto,
  ProductCondition,
  ProductConditionLabels,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../../../core/models';

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly product = signal<ProductDto | null>(null);
  protected readonly categories = signal<CategoryListDto[]>([]);
  protected readonly brands = signal<BrandDto[]>([]);

  protected readonly conditions = Object.values(ProductCondition).filter(
    (v) => typeof v === 'number',
  ) as ProductCondition[];
  protected readonly conditionLabels = ProductConditionLabels;

  protected readonly productForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required]],
    sku: ['', [Validators.required, Validators.maxLength(50)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    currency: ['EUR'],
    compareAtPrice: [null as number | null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    condition: [ProductCondition.New],
    weight: [0, [Validators.required, Validators.min(0)]],
    dimensions: [''],
    categoryId: ['', Validators.required],
    brandId: [''],
    isFeatured: [false],
    isActive: [true],
    images: this.fb.array([]),
    attributes: this.fb.array([]),
  });

  get images(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  get attributes(): FormArray {
    return this.productForm.get('attributes') as FormArray;
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((c) => this.categories.set(c));
    this.brandService.getBrands().subscribe((b) => this.brands.set(b));

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.productService.getProduct(id).subscribe({
        next: (product) => {
          this.product.set(product);
          this.populateForm(product);
          this.loading.set(false);
        },
        error: () => {
          this.toastService.show('Failed to load product', 'error');
          this.router.navigate(['/admin/products']);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  private populateForm(product: ProductDto): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      currency: product.currency,
      compareAtPrice: product.compareAtPrice ?? null,
      stockQuantity: product.stockQuantity,
      condition: product.condition,
      weight: product.weight,
      dimensions: product.dimensions ?? '',
      categoryId: product.categoryId,
      brandId: product.brandId ?? '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });

    // SKU is not editable in edit mode
    this.productForm.get('sku')?.disable();

    // Populate images
    product.images.forEach((img) => {
      this.images.push(
        this.fb.group({
          url: [img.url, Validators.required],
          altText: [img.altText ?? ''],
          displayOrder: [img.displayOrder],
          isPrimary: [img.isPrimary],
        }),
      );
    });

    // Populate attributes
    product.attributes.forEach((attr) => {
      this.attributes.push(
        this.fb.group({
          name: [attr.name, Validators.required],
          value: [attr.value, Validators.required],
        }),
      );
    });
  }

  protected addImage(): void {
    this.images.push(
      this.fb.group({
        url: ['', Validators.required],
        altText: [''],
        displayOrder: [this.images.length],
        isPrimary: [this.images.length === 0],
      }),
    );
  }

  protected removeImage(index: number): void {
    this.images.removeAt(index);
  }

  protected addAttribute(): void {
    this.attributes.push(
      this.fb.group({
        name: ['', Validators.required],
        value: ['', Validators.required],
      }),
    );
  }

  protected removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  protected onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.productForm.getRawValue();

    if (this.isEditMode()) {
      const request: UpdateProductRequest = {
        name: formValue.name!,
        description: formValue.description!,
        price: formValue.price!,
        currency: formValue.currency ?? 'EUR',
        compareAtPrice: formValue.compareAtPrice ?? undefined,
        stockQuantity: formValue.stockQuantity!,
        condition: formValue.condition!,
        weight: formValue.weight!,
        dimensions: formValue.dimensions || undefined,
        categoryId: formValue.categoryId!,
        brandId: formValue.brandId || undefined,
        isFeatured: formValue.isFeatured!,
        isActive: formValue.isActive!,
      };

      this.productService.updateProduct(this.product()!.id, request).subscribe({
        next: () => {
          this.toastService.show('Product updated successfully', 'success');
          this.saving.set(false);
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.toastService.show('Failed to update product', 'error');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreateProductRequest = {
        name: formValue.name!,
        description: formValue.description!,
        sku: formValue.sku!,
        price: formValue.price!,
        currency: formValue.currency ?? 'EUR',
        compareAtPrice: formValue.compareAtPrice ?? undefined,
        stockQuantity: formValue.stockQuantity!,
        condition: formValue.condition ?? ProductCondition.New,
        weight: formValue.weight!,
        dimensions: formValue.dimensions || undefined,
        categoryId: formValue.categoryId!,
        brandId: formValue.brandId || undefined,
        isFeatured: formValue.isFeatured ?? false,
        images: formValue.images!.map((img: any) => ({
          url: img.url,
          altText: img.altText || undefined,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
        })),
        attributes: formValue.attributes!.map((attr: any) => ({
          name: attr.name,
          value: attr.value,
        })),
      };

      this.productService.createProduct(request).subscribe({
        next: () => {
          this.toastService.show('Product created successfully', 'success');
          this.saving.set(false);
          this.router.navigate(['/admin/products']);
        },
        error: () => {
          this.toastService.show('Failed to create product', 'error');
          this.saving.set(false);
        },
      });
    }
  }
}
