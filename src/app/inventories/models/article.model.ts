export enum ArticleCategory {
    DURABLES = 'DURABLES',
    CONSUMABLES = 'CONSUMABLES',
    MATERIALS_CONSTRUCTION = 'MATERIALS_CONSTRUCTION',
    OTHERS = 'OTHERS'
  }

  export enum ArticleType {
    REGISTRABLE = 'REGISTRABLE',
    NON_REGISTRABLE = 'NON_REGISTRABLE'
  }

  export enum ArticleCondition {
    FUNCTIONAL = 'FUNCTIONAL',
    DEFECTIVE = 'DEFECTIVE',
    UNDER_REPAIR = 'UNDER_REPAIR'
  }

  export enum MeasurementUnit {
    LITERS = 'LITERS',
    KILOS = 'KILOS',
    UNITS = 'UNITS'
  }

  export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }

  export interface Article {
    id?: number;
    identifier?: string;
    name: string;
    description?: string;
    articleCondition: ArticleCondition;
    articleCategory: ArticleCategory;
    articleType: ArticleType;
    measurementUnit: MeasurementUnit;
  }

  export interface ArticlePost {
    identifier?: string;
    name: string;
    description?: string;
    articleCondition: ArticleCondition;
    articleCategory: ArticleCategory;
    articleType: ArticleType;
    measurementUnit: MeasurementUnit;
  }

  export interface ArticleInventoryPost {
    article: ArticlePost;
    stock: number;
    minStock: number;
    location: string;
    price: number;
  }
