import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHelplines } from '@/integrations/supabase/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Loader2, Phone, Globe, MapPin } from 'lucide-react';

const HelpCenter = () => {
  const { data: helplines, isLoading, error } = useQuery({
    queryKey: ['helplines'],
    queryFn: getHelplines,
  });

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Emergency Help Center</h1>
        <p className="text-lg text-muted-foreground mb-8">
          If you are in immediate danger, please call your local emergency services.
          Below is a list of resources that can provide support.
        </p>

        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center p-8 text-destructive">
            <p>Error loading resources. Please try again later.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helplines?.map((helpline: any) => (
            <Card key={helpline.id}>
              <CardHeader>
                <CardTitle>{helpline.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">{helpline.description}</p>
                {helpline.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${helpline.phone_number}`} className="hover:underline">{helpline.phone_number}</a>
                  </div>
                )}
                {helpline.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a href={helpline.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Visit Website</a>
                  </div>
                )}
                {helpline.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{helpline.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default HelpCenter;
