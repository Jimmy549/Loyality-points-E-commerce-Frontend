import { apiClient } from '../api/config';

export interface WebsiteContent {
  _id: string;
  section: string;
  type: string;
  key: string;
  value: any;
  isActive: boolean;
  order: number;
  metadata?: {
    title?: string;
    description?: string;
    alt?: string;
    link?: string;
  };
}

class WebsiteService {
  async getContentBySection(section: string): Promise<WebsiteContent[]> {
    try {
      const response = await apiClient.get(`/website/section/${section}`);
      return response.data;
    } catch (error) {
      // Silently return empty array if backend is unavailable
      return [];
    }
  }

  async getAllContent(): Promise<WebsiteContent[]> {
    try {
      const response = await apiClient.get('/website');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async createContent(content: Partial<WebsiteContent>): Promise<WebsiteContent> {
    const response = await apiClient.post('/website', content);
    return response.data;
  }

  async updateContent(id: string, content: Partial<WebsiteContent>): Promise<WebsiteContent> {
    const response = await apiClient.put(`/website/${id}`, content);
    return response.data;
  }

  async deleteContent(id: string): Promise<void> {
    await apiClient.delete(`/website/${id}`);
  }

  async seedDefaultContent(): Promise<void> {
    await apiClient.post('/website/seed');
  }

  // Helper methods for specific sections
  async getHeroContent(): Promise<{ title?: string; subtitle?: string; image?: string }> {
    const content = await this.getContentBySection('hero');
    const result: any = {};
    
    content.forEach(item => {
      if (item.key === 'main-title') result.title = item.value;
      if (item.key === 'subtitle') result.subtitle = item.value;
      if (item.key === 'hero-image') result.image = item.value;
    });
    
    return result;
  }

  async getBrands(): Promise<string[]> {
    const content = await this.getContentBySection('brands');
    const brandContent = content.find(item => item.key === 'brand-list');
    return brandContent?.value || [];
  }

  async getFooterInfo(): Promise<any> {
    const content = await this.getContentBySection('footer');
    const footerContent = content.find(item => item.key === 'company-info');
    return footerContent?.value || {};
  }
}

export const websiteService = new WebsiteService();