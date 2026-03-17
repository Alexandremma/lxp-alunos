import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Send, Upload, FileText, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { FinalSubmission as FinalSubmissionType } from '@/data/integratorMockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinalSubmissionProps {
  isSubmitted: boolean;
  onSubmit: () => void;
}

export function FinalSubmission({ isSubmitted, onSubmit }: FinalSubmissionProps) {
  const [submission, setSubmission] = useState<FinalSubmissionType>({
    synthesis: '',
    fileUrl: undefined,
    fileName: undefined,
    submittedAt: isSubmitted ? new Date().toISOString() : undefined
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleSubmit = () => {
    setShowConfirmDialog(false);
    setSubmission({
      ...submission,
      submittedAt: new Date().toISOString()
    });
    onSubmit();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSubmission({
        ...submission,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file)
      });
    }
  };

  if (isSubmitted) {
    const submittedDate = submission.submittedAt 
      ? format(new Date(submission.submittedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
      : format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });

    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Projeto Entregue</h3>
              <p className="text-sm text-muted-foreground">{submittedDate}</p>
            </div>
            <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
              <Lock className="h-3 w-3 mr-1" />
              Finalizado
            </Badge>
          </div>

          <Alert className="bg-muted/30 border-border/50">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Seu projeto foi entregue com sucesso e está em modo somente leitura. 
              Aguarde o feedback do orientador.
            </AlertDescription>
          </Alert>

          {submission.synthesis && (
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <Label className="text-sm text-muted-foreground">Síntese do Projeto</Label>
              <p className="mt-2 text-foreground">{submission.synthesis}</p>
            </div>
          )}

          {submission.fileName && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">{submission.fileName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            Entrega Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Synthesis */}
          <div>
            <Label>Síntese do Projeto</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Escreva um resumo do seu projeto, destacando os principais pontos e aprendizados.
            </p>
            <Textarea
              placeholder="Descreva a jornada do seu projeto, os resultados alcançados e os aprendizados mais significativos..."
              value={submission.synthesis}
              onChange={(e) => setSubmission({ ...submission, synthesis: e.target.value })}
              className="min-h-[200px]"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Arquivo Final</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Faça upload do documento final do seu projeto (PDF, DOCX, PPTX).
            </p>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {fileName || 'Clique para selecionar ou arraste o arquivo'}
                    </p>
                  </div>
                </div>
                <Input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.pptx"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {fileName && (
              <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                <FileText className="h-4 w-4" />
                <span>{fileName}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              Após a entrega, o projeto será bloqueado para edição. Certifique-se de que 
              todas as informações estão corretas antes de enviar.
            </AlertDescription>
          </Alert>

          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setShowConfirmDialog(true)}
            disabled={!submission.synthesis.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Entregar Projeto Integrador
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja entregar o Projeto Integrador? 
              Após a entrega, não será possível fazer alterações.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Confirmar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
