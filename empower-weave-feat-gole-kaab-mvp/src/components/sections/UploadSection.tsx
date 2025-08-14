import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, Image, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import imageCompression from 'browser-image-compression';
import { createDocument } from '@/integrations/supabase/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const UploadSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed ${file.name} from ${file.size / 1024 / 1024} MB to ${compressedFile.size / 1024 / 1024} MB`);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      toast({
        title: "Compression failed",
        description: `Could not compress ${file.name}. It will be uploaded in its original size.`,
        variant: "destructive",
      });
      return file;
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload files.",
        variant: "destructive",
      });
      return;
    }

    setCompressing(true);
    const processedFiles = await Promise.all(newFiles.map(compressImage));
    setFiles(prev => [...prev, ...processedFiles]);
    setCompressing(false);

    toast({
      title: "Files processed",
      description: `${processedFiles.length} file(s) ready for upload.`,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createDocumentMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUploads', user?.id] });
    },
    onError: (error) => {
      console.error('Error creating document record:', error);
    }
  });

  const handleUpload = async () => {
    if (!files.length || !user || !title) {
      toast({ title: 'Missing information', description: 'Please provide a title for your upload.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `${user.id}/${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('user_uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // Use upsert to allow overwriting for simplicity in this example
          });

        if (uploadError) throw uploadError;

        // Create a document record in the database
        await createDocumentMutation.mutateAsync({
          user_id: user.id,
          title,
          description,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          alt_text: file.type.startsWith('image/') ? altText : undefined,
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast({
        title: "Upload successful!",
        description: "Your files have been uploaded and are now available.",
      });
      setFiles([]);
      setTitle('');
      setDescription('');
      setAltText('');
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4 text-primary" />;
    } else if (['pdf', 'doc', 'docx'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-secondary" />;
    }
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <section id="upload" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Share Your Resources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload documents, reports, images, and other resources to share with the community.
            All uploads support accessibility features and multilingual content.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Files
                </CardTitle>
                <CardDescription>
                  Drag and drop files or click to browse. Supports documents, images, and reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-primary bg-primary/5 scale-105'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOC, Images, and more
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv"
                  />
                  <Button
                    variant="empowering"
                    onClick={() => !compressing && document.getElementById('file-input')?.click()}
                    disabled={compressing}
                  >
                    {compressing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {compressing ? 'Processing...' : 'Browse Files'}
                  </Button>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-foreground">Selected Files:</h4>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.name)}
                          <div>
                            <p className="text-sm font-medium text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading files...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Button */}
                {files.length > 0 && !uploading && (
                  <Button
                    variant="hero"
                    className="w-full mt-6"
                    onClick={handleUpload}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Upload {files.length} File{files.length > 1 ? 's' : ''}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Upload Form */}
            <Card className="bg-background/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Add Details</CardTitle>
                <CardDescription>
                  Provide information about your upload to help others find and understand your content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="transition-all duration-300 focus:shadow-soft"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your content and its relevance"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none h-24 transition-all duration-300 focus:shadow-soft"
                  />
                </div>

                {files.some(f => f.type.startsWith('image/')) && (
                  <div className="space-y-2">
                    <Label htmlFor="alt-text">Alternative Text for Images</Label>
                    <Input
                      id="alt-text"
                      placeholder="e.g., A group of women sitting in a circle"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="transition-all duration-300 focus:shadow-soft"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};