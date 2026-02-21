import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewService } from '../../../../core/services/review.service';
import { ReviewDto } from '../../../../core/models';

@Component({
  selector: 'app-review-moderation',
  imports: [CommonModule, TranslateModule],
  templateUrl: './review-moderation.component.html',
  styleUrl: './review-moderation.component.scss',
})
export class ReviewModerationComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);

  protected readonly reviews = signal<ReviewDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly processingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.loading.set(true);
    this.reviewService.getPendingReviews().subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onApprove(review: ReviewDto): void {
    this.processingId.set(review.id);
    this.reviewService.approveReview(review.id).subscribe({
      next: () => {
        this.reviews.update((list) => list.filter((r) => r.id !== review.id));
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null),
    });
  }

  protected onReject(review: ReviewDto): void {
    if (!confirm('Reject this review?')) return;
    this.processingId.set(review.id);
    this.reviewService.rejectReview(review.id).subscribe({
      next: () => {
        this.reviews.update((list) => list.filter((r) => r.id !== review.id));
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null),
    });
  }

  protected getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }
}
