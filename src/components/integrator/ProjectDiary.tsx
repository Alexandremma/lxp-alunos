import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Save, Check } from 'lucide-react';
import { DiaryEntry as DiaryEntryType, mockDiaryEntries } from '@/data/integratorMockData';
import { DiaryEntry } from './DiaryEntry';

interface ProjectDiaryProps {
  disabled?: boolean;
}

export function ProjectDiary({ disabled = false }: ProjectDiaryProps) {
  const [entries, setEntries] = useState<DiaryEntryType[]>(mockDiaryEntries);
  const [isWriting, setIsWriting] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [newEntry, setNewEntry] = useState({
    content: '',
    progress: '',
    challenges: '',
    learnings: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced auto-save simulation
  const debouncedSave = useCallback(() => {
    if (newEntry.content.trim()) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [newEntry.content]);

  useEffect(() => {
    const timer = setTimeout(debouncedSave, 1000);
    return () => clearTimeout(timer);
  }, [newEntry.content, debouncedSave]);

  const handleSaveEntry = () => {
    if (!newEntry.content.trim()) return;

    const entry: DiaryEntryType = {
      id: `diary-${Date.now()}`,
      content: newEntry.content,
      createdAt: new Date().toISOString(),
      guidingQuestions: showGuides ? {
        progress: newEntry.progress || undefined,
        challenges: newEntry.challenges || undefined,
        learnings: newEntry.learnings || undefined
      } : undefined
    };

    setEntries([entry, ...entries]);
    setNewEntry({ content: '', progress: '', challenges: '', learnings: '' });
    setIsWriting(false);
    setLastSaved(null);
  };

  return (
    <div className="space-y-6">
      {/* New Entry */}
      {isWriting ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Nova Entrada
              </CardTitle>
              <div className="flex items-center gap-4">
                {isSaving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Save className="h-3 w-3 animate-pulse" />
                    Salvando...
                  </span>
                )}
                {lastSaved && !isSaving && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Salvo
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-guides"
                    checked={showGuides}
                    onCheckedChange={setShowGuides}
                  />
                  <Label htmlFor="show-guides" className="text-sm text-muted-foreground">
                    Perguntas-guia
                  </Label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Escreva suas reflexões sobre o projeto..."
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              className="min-h-[150px] resize-none"
              disabled={disabled}
            />

            {showGuides && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
                <div>
                  <Label className="text-xs text-primary">O que avancei hoje?</Label>
                  <Input
                    placeholder="Descreva seu progresso..."
                    value={newEntry.progress}
                    onChange={(e) => setNewEntry({ ...newEntry, progress: e.target.value })}
                    className="mt-1"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label className="text-xs text-primary">Quais desafios encontrei?</Label>
                  <Input
                    placeholder="Liste os obstáculos..."
                    value={newEntry.challenges}
                    onChange={(e) => setNewEntry({ ...newEntry, challenges: e.target.value })}
                    className="mt-1"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label className="text-xs text-primary">O que aprendi neste processo?</Label>
                  <Input
                    placeholder="Compartilhe seus aprendizados..."
                    value={newEntry.learnings}
                    onChange={(e) => setNewEntry({ ...newEntry, learnings: e.target.value })}
                    className="mt-1"
                    disabled={disabled}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry} disabled={disabled || !newEntry.content.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Salvar entrada
              </Button>
              <Button variant="ghost" onClick={() => setIsWriting(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsWriting(true)}
          className="w-full"
          variant="outline"
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova entrada no diário
        </Button>
      )}

      {/* Previous Entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <DiaryEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {entries.length === 0 && !isWriting && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma entrada no diário ainda.</p>
          <p className="text-sm">Comece a documentar sua jornada no projeto!</p>
        </div>
      )}
    </div>
  );
}
