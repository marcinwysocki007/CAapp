"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BookOpen, Plus, Edit2, Trash2, Save, X, Tag, TrendingUp, Clock } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface KnowledgeEntry {
  id: string;
  category_id: string;
  title: string;
  content: string;
  keywords: string[];
  priority: number;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  category?: Category;
}

export default function WissensdatenbankPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<KnowledgeEntry> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadCategories(), loadEntries()]);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("knowledge_categories")
      .select("*")
      .order("sort_order");

    if (error) {
      toast.error("Fehler beim Laden der Kategorien");
      console.error(error);
    } else {
      setCategories(data || []);
    }
  };

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("knowledge_entries")
      .select(`
        *,
        category:knowledge_categories(*)
      `)
      .order("priority", { ascending: false });

    if (error) {
      toast.error("Fehler beim Laden der Einträge");
      console.error(error);
    } else {
      setEntries(data || []);
    }
  };

  const saveEntry = async () => {
    if (!editingEntry?.title || !editingEntry?.content || !editingEntry?.category_id) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    const entryData = {
      title: editingEntry.title,
      content: editingEntry.content,
      category_id: editingEntry.category_id,
      keywords: editingEntry.keywords || [],
      priority: editingEntry.priority || 0,
      is_active: editingEntry.is_active ?? true,
    };

    if (editingEntry.id) {
      const { error } = await supabase
        .from("knowledge_entries")
        .update(entryData)
        .eq("id", editingEntry.id);

      if (error) {
        toast.error("Fehler beim Aktualisieren");
        console.error(error);
      } else {
        toast.success("Eintrag aktualisiert");
        setIsEditDialogOpen(false);
        loadEntries();
      }
    } else {
      const { error } = await supabase
        .from("knowledge_entries")
        .insert([entryData]);

      if (error) {
        toast.error("Fehler beim Erstellen");
        console.error(error);
      } else {
        toast.success("Eintrag erstellt");
        setIsEditDialogOpen(false);
        loadEntries();
      }
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Möchten Sie diesen Eintrag wirklich löschen?")) return;

    const { error } = await supabase
      .from("knowledge_entries")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen");
      console.error(error);
    } else {
      toast.success("Eintrag gelöscht");
      loadEntries();
    }
  };

  const saveCategory = async () => {
    if (!editingCategory?.name || !editingCategory?.slug) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    const categoryData = {
      name: editingCategory.name,
      slug: editingCategory.slug,
      description: editingCategory.description || "",
      sort_order: editingCategory.sort_order || 0,
      is_active: editingCategory.is_active ?? true,
    };

    if (editingCategory.id) {
      const { error } = await supabase
        .from("knowledge_categories")
        .update(categoryData)
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("Fehler beim Aktualisieren");
        console.error(error);
      } else {
        toast.success("Kategorie aktualisiert");
        setIsCategoryDialogOpen(false);
        loadCategories();
      }
    } else {
      const { error } = await supabase
        .from("knowledge_categories")
        .insert([categoryData]);

      if (error) {
        toast.error("Fehler beim Erstellen");
        console.error(error);
      } else {
        toast.success("Kategorie erstellt");
        setIsCategoryDialogOpen(false);
        loadCategories();
      }
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Möchten Sie diese Kategorie wirklich löschen? Alle zugehörigen Einträge werden ebenfalls gelöscht.")) return;

    const { error } = await supabase
      .from("knowledge_categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Fehler beim Löschen");
      console.error(error);
    } else {
      toast.success("Kategorie gelöscht");
      loadCategories();
      loadEntries();
    }
  };

  const filteredEntries = selectedCategory === "all"
    ? entries
    : entries.filter(e => e.category_id === selectedCategory);

  const stats = {
    totalEntries: entries.length,
    activeEntries: entries.filter(e => e.is_active).length,
    totalViews: entries.reduce((sum, e) => sum + e.usage_count, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Wissensdatenbank
            </h1>
            <p className="text-gray-600 mt-2">
              Verwalten Sie Inhalte für die Chat-AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Gesamt Einträge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEntries}</div>
              <p className="text-sm text-green-600 mt-1">{stats.activeEntries} aktiv</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{categories.length}</div>
              <p className="text-sm text-gray-600 mt-1">{categories.filter(c => c.is_active).length} aktiv</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Gesamt Aufrufe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <p className="text-sm text-gray-600 mt-1">durch Chat-AI</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="entries" className="space-y-6">
          <TabsList>
            <TabsTrigger value="entries">Einträge</TabsTrigger>
            <TabsTrigger value="categories">Kategorien</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingEntry({ is_active: true, priority: 5, keywords: [] });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Eintrag
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEntry?.id ? "Eintrag bearbeiten" : "Neuer Eintrag"}
                    </DialogTitle>
                    <DialogDescription>
                      Erstellen oder bearbeiten Sie einen Wissensdatenbank-Eintrag
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">Titel *</Label>
                      <Input
                        id="title"
                        value={editingEntry?.title || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                        placeholder="z.B. Durchschnittliche Kosten"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Kategorie *</Label>
                      <Select
                        value={editingEntry?.category_id || ""}
                        onValueChange={(value) => setEditingEntry({ ...editingEntry, category_id: value })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="content">Inhalt *</Label>
                      <Textarea
                        id="content"
                        value={editingEntry?.content || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                        placeholder="Detaillierte Antwort oder Information..."
                        rows={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor="keywords">Suchbegriffe (kommagetrennt)</Label>
                      <Input
                        id="keywords"
                        value={editingEntry?.keywords?.join(", ") || ""}
                        onChange={(e) => setEditingEntry({
                          ...editingEntry,
                          keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean)
                        })}
                        placeholder="kosten, preis, monatlich"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priorität (0-10)</Label>
                        <Input
                          id="priority"
                          type="number"
                          min="0"
                          max="10"
                          value={editingEntry?.priority || 0}
                          onChange={(e) => setEditingEntry({ ...editingEntry, priority: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-8">
                        <Switch
                          id="is_active"
                          checked={editingEntry?.is_active ?? true}
                          onCheckedChange={(checked) => setEditingEntry({ ...editingEntry, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Aktiv</Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Abbrechen
                    </Button>
                    <Button onClick={saveEntry}>
                      <Save className="w-4 h-4 mr-2" />
                      Speichern
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className={!entry.is_active ? "opacity-50" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {entry.title}
                          {!entry.is_active && <Badge variant="secondary">Inaktiv</Badge>}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {entry.category?.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{entry.content}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {entry.keywords.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          <div className="flex gap-1">
                            {entry.keywords.map((keyword, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Priorität: {entry.priority}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {entry.usage_count}x verwendet
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredEntries.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Keine Einträge gefunden
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingCategory({ is_active: true, sort_order: categories.length });
                      setIsCategoryDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Kategorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory?.id ? "Kategorie bearbeiten" : "Neue Kategorie"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="cat_name">Name *</Label>
                      <Input
                        id="cat_name"
                        value={editingCategory?.name || ""}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="z.B. Kosten & Preise"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cat_slug">Slug * (URL-freundlich)</Label>
                      <Input
                        id="cat_slug"
                        value={editingCategory?.slug || ""}
                        onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                        placeholder="z.B. kosten-preise"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cat_description">Beschreibung</Label>
                      <Textarea
                        id="cat_description"
                        value={editingCategory?.description || ""}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        placeholder="Kurze Beschreibung der Kategorie"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cat_sort_order">Sortierung</Label>
                        <Input
                          id="cat_sort_order"
                          type="number"
                          value={editingCategory?.sort_order || 0}
                          onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-8">
                        <Switch
                          id="cat_is_active"
                          checked={editingCategory?.is_active ?? true}
                          onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, is_active: checked })}
                        />
                        <Label htmlFor="cat_is_active">Aktiv</Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={saveCategory}>
                      Speichern
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className={!category.is_active ? "opacity-50" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {category.name}
                          {!category.is_active && <Badge variant="secondary">Inaktiv</Badge>}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {category.description || "Keine Beschreibung"}
                        </CardDescription>
                        <div className="mt-2 text-sm text-gray-600">
                          Slug: <code className="bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                          {" • "}
                          Sortierung: {category.sort_order}
                          {" • "}
                          {entries.filter(e => e.category_id === category.id).length} Einträge
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setIsCategoryDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
