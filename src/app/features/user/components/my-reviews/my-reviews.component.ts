import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewService } from '../../../../core/services/review.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ReviewDto, UpdateReviewRequest } from '../../../../core/models/review.model';

@Component({
  selector: 'app-my-reviews',
  imports: [RouterLink, DatePipe, FormsModule, TranslateModule],
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.scss',
})
export class MyReviewsComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly toastService = inject(ToastService);

  protected readonly reviews = signal<ReviewDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly editingId = signal<string | null>(null);

  protected editRating = 0;
  protected editTitle = '';
  protected editComment = '';

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.loading.set(true);
    this.reviewService.getMyReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected startEdit(review: ReviewDto): void {
    this.editingId.set(review.id);
    this.editRating = review.rating;
    this.editTitle = review.title ?? '';
    this.editComment = review.comment ?? '';
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(reviewId: string): void {
    const request: UpdateReviewRequest = {
      rating: this.editRating,
      title: this.editTitle || undefined,
      comment: this.editComment || undefined,
    };

    this.reviewService.updateReview(reviewId, request).subscribe({
      next: () => {
        this.editingId.set(null);
        this.toastService.show('TOAST.REVIEW_UPDATED', 'success');
        this.loadReviews();
      },
      error: () => {
        this.toastService.show('TOAST.REVIEW_ERROR', 'error');
      },
    });
  }

  protected deleteReview(reviewId: string): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews.update((r) => r.filter((rev) => rev.id !== reviewId));
        this.toastService.show('TOAST.REVIEW_DELETED', 'success');
      },
      error: () => {
        this.toastService.show('TOAST.REVIEW_ERROR', 'error');
      },
    });
  }

  protected setEditRating(rating: number): void {
    this.editRating = rating;
  }
}
