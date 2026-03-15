import { Component } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Header } from '../../../components/common/header/header';
import { HighlightMenuItem } from '../../../components/customer/highlight-menu-item/highlight-menu-item';
import { MenuItem } from '../../../components/customer/menu-item/menu-item';

interface MenuItems {
  id: number;
  name: string;
  imageSrc: string;
  description?: string;
  price: number;
  category?: string;
  recommended?: boolean;
}

@Component({
  selector: 'app-order-page',
  imports: [Header, HighlightMenuItem, MenuItem, KeyValuePipe],
  templateUrl: './order-page.html',
  styleUrl: './order-page.scss',
})
export class OrderPage {
  basketCount = 1; // TODO: replace with actual basket item count
  preserveOrder = () => 0;
  menuItems: MenuItems[] = [];
  recommendedItems: MenuItems[] = [];
  ordinaryItems: MenuItems[] = [];
  ordinaryMenuByCategory: { [category: string]: MenuItems[] } = {};

  ngOnInit() {
    this.menuItems = [
      {
        id: 1,
        name: 'Picanha Steak',
        imageSrc: 'assets/images/steak.jpg',
        price: 250,
        recommended: true,
      },
      {
        id: 2,
        name: 'Smoked Salmon Pizza',
        imageSrc: 'assets/images/pizza.jpg',
        price: 429,
        recommended: true,
      },
      {
        id: 3,
        name: 'Pesto Pasta',
        imageSrc: 'assets/images/pasta.jpg',
        price: 169,
        recommended: true,
      },
      {
        id: 4,
        name: 'Mashroom Risotto',
        category: 'Pasta',
        imageSrc:
          'https://www.eatingwell.com/thmb/Mc1Yo_NWBctQAoYv72NEd2KijRs=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/mushroom-risotto-beauty-8025316-4000x4000-203a642728ca49c895b487d6df0dc6e3.jpg',
        price: 250,
        recommended: false,
      },
      {
        id: 5,
        name: 'Shrimp and Grits',
        category: 'Others',
        imageSrc:
          'https://www.allrecipes.com/thmb/pEcPgOxCX-akb5ZN-yQlqLeFPD8=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/236806-Chef-Johns-Shrimp-Grits-DDMFS-Beauty-4x3-f9373d2306f843de9001985fe522a385.jpg',
        price: 429,
        recommended: false,
      },
      {
        id: 6,
        name: 'Caesar Salad',
        category: 'Salad',
        imageSrc:
          'https://www.jonesdairyfarm.com/wp-content/uploads/2024/10/Bacon-Caesar-Salad-1024x683.jpg',
        price: 169,
        recommended: false,
      },
      {
        id: 7,
        name: 'Rocket Salad',
        category: 'Salad',
        imageSrc:
          'https://www.chefnotrequired.com/wp-content/uploads/2024/10/rocket-salad-blog-hero.jpg',
        price: 169,
        recommended: false,
      },
      {
        id: 8,
        name: 'Greek Salad',
        category: 'Salad',
        imageSrc: 'https://www.tamingtwins.com/wp-content/uploads/2025/07/Greek-Salad-4.jpg',
        price: 169,
        recommended: false,
      },
      {
        id: 9,
        name: 'Carbonara Pasta',
        category: 'Pasta',
        imageSrc:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAVjB7k7UPFUYUIHmOq8WUMxws77BdH_cp-aDPYYyYSb7f6lOxCbmV-TfX0T1aQNRgXOv_H_uuYxxR_vGhF9Cknk6LKocrvPXgGYnqyA2yuFd2F36UrhmkigqwQ6YqSPHSalQ&s=10&ec=121584926',
        price: 169,
        recommended: false,
      },
    ];
    this.recommendedItems = this.menuItems.filter((item) => item.recommended);
    this.ordinaryItems = this.menuItems.filter((item) => !item.recommended);
    const grouped = this.ordinaryItems.reduce(
      (acc, item) => {
        const category = item.category || 'Others';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {} as { [category: string]: MenuItems[] },
    );
    this.ordinaryMenuByCategory = Object.fromEntries(
      Object.keys(grouped)
        .sort((a, b) => {
          // TODO: category order will be driven by the API in the future
          const categoryOrder: { [key: string]: number } = {
            Special: 1,
            Appetiser: 2,
            Soup: 3,
            Salad: 4,
            Main: 5,
            Pasta: 6,
            Side: 7,
            Dessert: 8,
            Drinks: 9,
            Others: 10,
          };
          const orderA = categoryOrder[a] ?? 8;
          const orderB = categoryOrder[b] ?? 8;
          return orderA - orderB;
        })
        .map((key) => [key, grouped[key]]),
    );
  }
}
