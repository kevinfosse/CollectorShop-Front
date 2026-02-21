import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  CategoryListDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../../core/models';

@Component({
  selector: 'app-admin-category-list',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly categories = signal<CategoryListDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    slug: ['', [Validators.required, Validators.maxLength(100)]],
    imageUrl: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    parentCategoryId: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load categories', 'error');
        this.loading.set(false);
      },
    });
  }

  protected onAdd(): void {
    this.editingId.set(null);
    this.categoryForm.reset({ displayOrder: 0, isActive: true });
    this.showForm.set(true);
  }

  protected onEdit(category: CategoryListDto): void {
    this.editingId.set(category.id);
    this.categoryService.getCategory(category.id).subscribe({
      next: (cat) => {
        this.categoryForm.patchValue({
          name: cat.name,
          description: cat.description,
          slug: cat.slug,
          imageUrl: cat.imageUrl ?? '',
          displayOrder: cat.displayOrder,
          parentCategoryId: cat.parentCategoryId ?? '',
          isActive: cat.isActive,
        });
        this.showForm.set(true);
      },
    });
  }

  protected onCancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  protected onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.categoryForm.value;
    const editId = this.editingId();

    if (editId) {
      const request: UpdateCategoryRequest = {
        name: formValue.name!,
        description: formValue.description ?? '',
        slug: formValue.slug!,
        imageUrl: formValue.imageUrl || undefined,
        displayOrder: formValue.displayOrder!,
        parentCategoryId: formValue.parentCategoryId || undefined,
        isActive: formValue.isActive!,
      };

      this.categoryService.updateCategory(editId, request).subscribe({
        next: () => {
          this.toastService.show('Category updated', 'success');
          this.saving.set(false);
          this.showForm.set(false);
          this.editingId.set(null);
          this.loadCategories();
        },
        error: () => {
          this.toastService.show('Failed to update category', 'error');
          this.saving.set(false);
        },
      });
    } else {
      const request: CreateCategoryRequest = {
        name: formValue.name!,
        description: formValue.description ?? '',
        slug: formValue.slug!,
        imageUrl: formValue.imageUrl || undefined,
        displayOrder: formValue.displayOrder!,
        parentCategoryId: formValue.parentCategoryId || undefined,
      };

      this.categoryService.createCategory(request).subscribe({
        next: () => {
          this.toastService.show('Category created', 'success');
          this.saving.set(false);
          this.showForm.set(false);
          this.loadCategories();
        },
        error: () => {
          this.toastService.show('Failed to create category', 'error');
          this.saving.set(false);
        },
      });
    }
  }

  protected onDelete(category: CategoryListDto): void {
    if (confirm(`Delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.toastService.show('Category deleted', 'success');
          this.loadCategories();
        },
        error: () => this.toastService.show('Failed to delete category', 'error'),
      });
    }
  }

  protected generateSlug(): void {
    const name = this.categoryForm.get('name')?.value;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      this.categoryForm.patchValue({ slug });
    }
  }
}
