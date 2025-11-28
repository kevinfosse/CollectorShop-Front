import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected currentYear = new Date().getFullYear();

  protected footerLinks = {
    shop: [
      { label: 'All Products', path: '/catalog' },
      { label: 'Trading Cards', path: '/catalog/trading-cards' },
      { label: 'Figurines', path: '/catalog/figurines' },
      { label: 'Vintage Items', path: '/catalog/vintage' },
      { label: 'New Arrivals', path: '/catalog?sort=newest' },
    ],
    support: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'FAQs', path: '/faq' },
      { label: 'Shipping Info', path: '/shipping' },
      { label: 'Returns', path: '/returns' },
      { label: 'Track Order', path: '/track-order' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
    ],
  };

  protected socialLinks = [
    { icon: 'pi-instagram', url: 'https://instagram.com', label: 'Instagram' },
    { icon: 'pi-twitter', url: 'https://twitter.com', label: 'Twitter' },
    { icon: 'pi-facebook', url: 'https://facebook.com', label: 'Facebook' },
    { icon: 'pi-youtube', url: 'https://youtube.com', label: 'YouTube' },
  ];
}
