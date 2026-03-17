import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected currentYear = new Date().getFullYear();

  protected footerLinks = {
    shop: [
      { label: 'FOOTER.LINKS.ALL_PRODUCTS', path: '/catalog' },
      { label: 'FOOTER.LINKS.TRADING_CARDS', path: '/catalog/trading-cards' },
      { label: 'FOOTER.LINKS.FIGURINES', path: '/catalog/figurines' },
      { label: 'FOOTER.LINKS.VINTAGE_ITEMS', path: '/catalog/vintage' },
      { label: 'FOOTER.LINKS.NEW_ARRIVALS', path: '/catalog?sort=newest' },
    ],
    support: [
      { label: 'FOOTER.LINKS.CONTACT_US', path: '/contact' },
      { label: 'FOOTER.LINKS.FAQS', path: '/faq' },
      { label: 'FOOTER.LINKS.SHIPPING_INFO', path: '/shipping' },
      { label: 'FOOTER.LINKS.RETURNS', path: '/returns' },
      { label: 'FOOTER.LINKS.TRACK_ORDER', path: '/track-order' },
    ],
    company: [
      { label: 'FOOTER.LINKS.ABOUT_US', path: '/about' },
      { label: 'FOOTER.LINKS.BLOG', path: '/blog' },
      { label: 'FOOTER.LINKS.CAREERS', path: '/careers' },
      { label: 'FOOTER.LINKS.PRESS', path: '/press' },
    ],
    legal: [
      { label: 'FOOTER.LINKS.PRIVACY_POLICY', path: '/privacy' },
      { label: 'FOOTER.LINKS.TERMS_OF_SERVICE', path: '/terms' },
      { label: 'FOOTER.LINKS.COOKIE_POLICY', path: '/cookies' },
    ],
  };

  protected socialLinks = [
    { icon: 'pi-instagram', url: 'https://instagram.com', label: 'Instagram' },
    { icon: 'pi-twitter', url: 'https://twitter.com', label: 'Twitter' },
    { icon: 'pi-facebook', url: 'https://facebook.com', label: 'Facebook' },
    { icon: 'pi-youtube', url: 'https://youtube.com', label: 'YouTube' },
  ];
}
