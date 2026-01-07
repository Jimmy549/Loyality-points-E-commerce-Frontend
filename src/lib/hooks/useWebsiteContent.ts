"use client";

import { useState, useEffect } from 'react';
import { websiteService, WebsiteContent } from '../services/website.service';

export const useWebsiteContent = (section?: string) => {
  const [content, setContent] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = section 
          ? await websiteService.getContentBySection(section)
          : await websiteService.getAllContent();
          
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  const getContentByKey = (key: string) => {
    return content.find(item => item.key === key)?.value;
  };

  const getContentWithMetadata = (key: string) => {
    return content.find(item => item.key === key);
  };

  return {
    content,
    loading,
    error,
    getContentByKey,
    getContentWithMetadata,
    refetch: () => {
      const fetchContent = async () => {
        try {
          setLoading(true);
          const data = section 
            ? await websiteService.getContentBySection(section)
            : await websiteService.getAllContent();
          setContent(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch content');
        } finally {
          setLoading(false);
        }
      };
      fetchContent();
    }
  };
};

export const useHeroContent = () => {
  const [heroData, setHeroData] = useState<{ title?: string; subtitle?: string; image?: string }>({
    title: 'FIND CLOTHES THAT MATCHES YOUR STYLE',
    subtitle: 'Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const data = await websiteService.getHeroContent();
        if (data.title || data.subtitle) {
          setHeroData(data);
        }
      } catch (error) {
        // Keep default data on error
      }
    };

    fetchHeroContent();
  }, []);

  return { heroData, loading };
};

export const useBrands = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await websiteService.getBrands();
        setBrands(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch brands:', error);
        }
        // Set empty array on error
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading };
};