import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, File, Image, FileText, X, CheckCircle } from 'lucide-react';

export const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files added successfully",
        description: `${newFiles.length} file(s) ready for upload`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files selected",
        description: `${newFiles.length} file(s) ready for upload`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async () => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setUploading(false);
    setFiles([]);
    toast({
      title: "Upload successful!",
      description: "Your files have been uploaded and are now available to the community.",
    });
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
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Browse Files
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
                    onClick={simulateUpload}
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
                  Provide additional information about your upload to help others find and understand your content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    placeholder="Enter a descriptive title"
                    className="transition-all duration-300 focus:shadow-soft"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Describe your content and its relevance to the community"
                    className="resize-none h-24 transition-all duration-300 focus:shadow-soft"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-transparent">
                    <option value="">Select a category</option>
                    <option value="research">Research & Reports</option>
                    <option value="policy">Policy Documents</option>
                    <option value="community">Community Resources</option>
                    <option value="advocacy">Advocacy Materials</option>
                    <option value="education">Educational Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tags</label>
                  <Input
                    placeholder="youth, women, disability, rights (comma separated)"
                    className="transition-all duration-300 focus:shadow-soft"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="accessible" className="rounded" />
                  <label htmlFor="accessible" className="text-sm text-foreground">
                    This content includes accessibility features (alt text, captions, etc.)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="multilingual" className="rounded" />
                  <label htmlFor="multilingual" className="text-sm text-foreground">
                    Available in multiple languages
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};