import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUp, Link as LinkIcon } from 'lucide-react';
import { TaskEvidence } from '@/data/integratorMockData';

interface TaskEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvidence: (evidence: TaskEvidence) => void;
}

export function TaskEvidenceDialog({ open, onOpenChange, onAddEvidence }: TaskEvidenceDialogProps) {
  const [type, setType] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !url.trim()) return;

    const fileType = type === 'file' ? url.split('.').pop()?.toLowerCase() : undefined;
    
    const newEvidence: TaskEvidence = {
      id: `ev-${Date.now()}`,
      type,
      title: title.trim(),
      url: url.trim(),
      fileType,
      uploadedAt: new Date().toISOString()
    };

    onAddEvidence(newEvidence);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setType('file');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Anexar Evidência</DialogTitle>
          <DialogDescription>
            Adicione um arquivo ou link como evidência desta tarefa.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={type} onValueChange={(v) => setType(v as 'file' | 'link')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="gap-2">
              <FileUp className="h-4 w-4" />
              Arquivo
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Link
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-title">Título</Label>
              <Input
                id="file-title"
                placeholder="Ex: Documento de Escopo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-url">URL do arquivo</Label>
              <Input
                id="file-url"
                placeholder="Ex: /documents/escopo.pdf"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL do arquivo hospedado ou caminho local.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">Título</Label>
              <Input
                id="link-title"
                placeholder="Ex: Figma - Wireframes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="Ex: https://figma.com/file/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !url.trim()}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
