export interface Series {
    series_id: number
    title: string
    url: string
    associated: Associated[]
    description: string
    image: Image
    type: string
    year: string
    bayesian_rating: number
    rating_votes: number
    genres: Genre[]
    categories: Category[]
    latest_chapter: number
    forum_id: number
    status: string
    licensed: boolean
    completed: boolean
    anime: Anime
    related_series: any[]
    authors: Author[]
    publishers: Publisher[]
    publications: Publication[]
    recommendations: any[]
    category_recommendations: CategoryRecommendation[]
    rank: Rank
    last_updated: LastUpdated
  }
  
  export interface Associated {
    title: string
  }
  
  export interface Image {
    url: Url
    height: number
    width: number
  }
  
  export interface Url {
    original: string
    thumb: string
  }
  
  export interface Genre {
    genre: string
  }
  
  export interface Category {
    series_id: number
    category: string
    votes: number
    votes_plus: number
    votes_minus: number
    added_by: number
  }
  
  export interface Anime {
    start: any
    end: any
  }
  
  export interface Author {
    name: string
    author_id: number
    type: string
  }
  
  export interface Publisher {
    publisher_name: string
    publisher_id: number
    type: string
    notes: string
  }
  
  export interface Publication {
    publication_name: string
    publisher_name: string
    publisher_id: number
  }
  
  export interface CategoryRecommendation {
    series_name: string
    series_id: number
    weight: number
  }
  
  export interface Rank {
    position: Position
    old_position: OldPosition
    lists: Lists
  }
  
  export interface Position {
    week: number
    month: number
    three_months: number
    six_months: number
    year: number
  }
  
  export interface OldPosition {
    week: number
    month: number
    three_months: number
    six_months: number
    year: number
  }
  
  export interface Lists {
    reading: number
    wish: number
    complete: number
    unfinished: number
    custom: number
  }
  
  export interface LastUpdated {
    timestamp: number
    as_rfc3339: string
    as_string: string
  }
  