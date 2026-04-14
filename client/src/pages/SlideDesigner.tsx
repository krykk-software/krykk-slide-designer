import { useState, useRef, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { toPng } from 'html-to-image';
import { Block, BlockTemplate, Page, SlideProject, CanvasSize, CANVAS_SIZES, DEFAULT_CANVAS_SIZE, SLIDE_TEMPLATES, SlideTemplate, ImageData, FooterSettings, DEFAULT_FOOTER_SETTINGS, BLOCK_COLORS, BLOCK_TEMPLATES, ChartDataPoint, PipelineData, FunnelData, TimelineData, TableData, CalendarData } from '@/lib/types';
import { generateMonochromaticScale } from '@/lib/utils';
import { SlideCanvas } from '@/components/SlideCanvas';
import { BlockPicker } from '@/components/BlockPicker';
import { BlockEditor } from '@/components/BlockEditor';
import { ExportDialog } from '@/components/ExportDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Download, Trash2, RotateCcw, Plus, ChevronLeft, ChevronRight, Upload, FileJson, Image, Settings, LucideIcon, Cloud, CloudOff, Save, FolderOpen, LogOut, Loader2, Camera, History, Undo2, Redo2, UserX, FileText, Shield, Palette } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Project, Snapshot } from '@shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const createEmptyPage = (name?: string): Page => ({
  id: nanoid(),
  name: name || 'Untitled Page',
  blocks: [],
});

const createPageFromTemplate = (template: SlideTemplate, pageName?: string): Page => ({
  id: nanoid(),
  name: pageName || template.name,
  blocks: template.blocks.map(block => ({
    ...block,
    id: nanoid(),
  })),
});

const validateProject = (data: unknown): data is SlideProject => {
  if (!data || typeof data !== 'object') return false;
  const project = data as Record<string, unknown>;
  
  if (!Array.isArray(project.pages) || project.pages.length === 0) return false;
  
  for (const page of project.pages) {
    if (!page || typeof page !== 'object') return false;
    const p = page as Record<string, unknown>;
    if (typeof p.id !== 'string' || typeof p.name !== 'string') return false;
    if (!Array.isArray(p.blocks)) return false;
    
    for (const block of p.blocks as unknown[]) {
      if (!block || typeof block !== 'object') return false;
      const b = block as Record<string, unknown>;
      if (typeof b.id !== 'string' || typeof b.type !== 'string' || typeof b.title !== 'string') return false;
      if (!b.position || typeof b.position !== 'object') return false;
      if (!b.size || typeof b.size !== 'object') return false;
      if (!b.data) return false;
    }
  }
  
  return true;
};

export default function SlideDesigner() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportImage, setExportImage] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(true);
  const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);
  const [isSnapshotHistoryOpen, setIsSnapshotHistoryOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [pendingAddPage, setPendingAddPage] = useState(false);
  const [isCalendarConfigOpen, setIsCalendarConfigOpen] = useState(false);
  const [calendarConfigPendingTemplate, setCalendarConfigPendingTemplate] = useState<SlideTemplate | null>(null);
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('month');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarStartHour, setCalendarStartHour] = useState(8);
  const [calendarEndHour, setCalendarEndHour] = useState(18);
  const [calendarShowWeekends, setCalendarShowWeekends] = useState(true);
  const [calendarWeekStartDate, setCalendarWeekStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().split('T')[0];
  });
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('My Slide Project');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({ ...DEFAULT_FOOTER_SETTINGS });
  const [undoStack, setUndoStack] = useState<Block[][]>([]);
  const [redoStack, setRedoStack] = useState<Block[][]>([]);
  const skipHistoryRef = useRef(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const saveProjectMutation = useMutation({
    mutationFn: async (data: { name: string; data: SlideProject }) => {
      if (currentProjectId) {
        return apiRequest('PUT', `/api/projects/${currentProjectId}`, data);
      } else {
        return apiRequest('POST', '/api/projects', data);
      }
    },
    onSuccess: async (response) => {
      const savedProject = await response.json();
      setCurrentProjectId(savedProject.id);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project saved',
        description: 'Your project has been saved to the cloud.',
      });
    },
    onError: () => {
      toast({
        title: 'Save failed',
        description: 'Failed to save your project.',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been removed.',
      });
    },
  });

  const { data: snapshots = [], isLoading: isLoadingSnapshots } = useQuery<Snapshot[]>({
    queryKey: ['/api/projects', currentProjectId, 'snapshots'],
    queryFn: async () => {
      if (!currentProjectId) return [];
      const res = await fetch(`/api/projects/${currentProjectId}/snapshots`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch snapshots');
      return res.json();
    },
    enabled: !!currentProjectId,
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async (data: { name: string; imageData: string }) => {
      if (!currentProjectId) throw new Error('No project selected');
      return apiRequest('POST', `/api/projects/${currentProjectId}/snapshots`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'snapshots'] });
      toast({
        title: 'Snapshot saved',
        description: 'Your project snapshot has been saved.',
      });
    },
  });

  const deleteSnapshotMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/snapshots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProjectId, 'snapshots'] });
      toast({
        title: 'Snapshot deleted',
        description: 'The snapshot has been removed.',
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/account');
    },
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  const currentPage = pages[currentPageIndex];
  const blocks = currentPage?.blocks || [];

  const pushToUndoStack = useCallback((snapshot: Block[]) => {
    if (skipHistoryRef.current) return;
    setUndoStack(prev => {
      const next = [...prev, snapshot];
      if (next.length > 50) next.shift();
      return next;
    });
    setRedoStack([]);
  }, []);

  const dragStartSnapshotRef = useRef<Block[] | null>(null);

  const saveDragStartSnapshot = useCallback(() => {
    const currentBlocks = pages[currentPageIndex]?.blocks || [];
    dragStartSnapshotRef.current = JSON.parse(JSON.stringify(currentBlocks));
  }, [pages, currentPageIndex]);

  const commitDragSnapshot = useCallback(() => {
    if (dragStartSnapshotRef.current) {
      pushToUndoStack(dragStartSnapshotRef.current);
      dragStartSnapshotRef.current = null;
    }
  }, [pushToUndoStack]);

  const updateCurrentPageBlocks = useCallback((updater: (blocks: Block[]) => Block[], skipUndo = false) => {
    if (!skipUndo && !skipHistoryRef.current && !dragStartSnapshotRef.current) {
      setPages(prev => {
        const currentBlocks = prev[currentPageIndex]?.blocks || [];
        pushToUndoStack(JSON.parse(JSON.stringify(currentBlocks)));
        return prev.map((page, idx) =>
          idx === currentPageIndex ? { ...page, blocks: updater(page.blocks) } : page
        );
      });
    } else {
      setPages(prev => prev.map((page, idx) =>
        idx === currentPageIndex ? { ...page, blocks: updater(page.blocks) } : page
      ));
    }
    setHasUnsavedChanges(true);
  }, [currentPageIndex, pushToUndoStack]);

  const handleSaveToCloud = useCallback(() => {
    const project: SlideProject = {
      version: '1.0',
      name: projectName,
      pages: pages,
      canvasSize: canvasSize,
      globalFooter: footerSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProjectMutation.mutate({ name: projectName, data: project });
  }, [pages, canvasSize, projectName, footerSettings, saveProjectMutation]);

  const handleLoadProject = useCallback((project: Project) => {
    const data = project.data as SlideProject;
    if (validateProject(data)) {
      setPages(data.pages);
      setCurrentPageIndex(0);
      if (data.canvasSize) {
        setCanvasSize(data.canvasSize);
      }
      if (data.globalFooter) {
        setFooterSettings(data.globalFooter);
      } else {
        setFooterSettings({ ...DEFAULT_FOOTER_SETTINGS });
      }
      setCurrentProjectId(project.id);
      setProjectName(project.name);
      setHasUnsavedChanges(false);
      setIsTemplateDialogOpen(false);
      setIsProjectsDialogOpen(false);
      toast({
        title: 'Project loaded',
        description: `Loaded "${project.name}".`,
      });
    } else {
      toast({
        title: 'Load failed',
        description: 'Invalid project data.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleNewProject = useCallback(() => {
    setPages([]);
    setCurrentPageIndex(0);
    setCurrentProjectId(null);
    setProjectName('My Slide Project');
    setHasUnsavedChanges(false);
    setFooterSettings({ ...DEFAULT_FOOTER_SETTINGS });
    setIsTemplateDialogOpen(true);
    setIsProjectsDialogOpen(false);
  }, []);

  const handleSelectTemplate = useCallback((template: SlideTemplate) => {
    if (template.id === 'calendar') {
      setCalendarConfigPendingTemplate(template);
      setIsCalendarConfigOpen(true);
      return;
    }
    if (pendingAddPage) {
      const newPage = createPageFromTemplate(template, `Page ${pages.length + 1}`);
      setPages(prev => [...prev, newPage]);
      setCurrentPageIndex(pages.length);
      toast({
        title: 'Page added',
        description: template.id === 'blank' ? 'Blank page created.' : `${template.name} template applied.`,
      });
      setPendingAddPage(false);
    } else {
      const firstPage = createPageFromTemplate(template, 'Page 1');
      setPages([firstPage]);
      setCurrentPageIndex(0);
      toast({
        title: 'Project started',
        description: template.id === 'blank' ? 'Started with a blank slide.' : `Started with ${template.name} template.`,
      });
    }
    setIsTemplateDialogOpen(false);
  }, [pages.length, pendingAddPage, toast]);

  const handleConfirmCalendarConfig = useCallback(() => {
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    let title = '';
    if (calendarView === 'week') {
      const d = new Date(calendarWeekStartDate);
      const end = new Date(d);
      end.setDate(d.getDate() + (calendarShowWeekends ? 6 : 4));
      title = `Week of ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (calendarView === 'month') {
      title = `${MONTH_NAMES[calendarMonth - 1]} ${calendarYear}`;
    } else {
      title = String(calendarYear);
    }

    const calData: CalendarData = {
      view: calendarView,
      weekStartDate: calendarWeekStartDate,
      startHour: calendarStartHour,
      endHour: calendarEndHour,
      showWeekends: calendarShowWeekends,
      month: calendarMonth,
      year: calendarYear,
      title,
    };

    const calBlock: Omit<Block, 'id'> = {
      type: 'calendar',
      title,
      icon: 'CalendarDays',
      position: { x: 0, y: 0 },
      size: { width: canvasSize.width, height: canvasSize.height },
      data: calData,
      color: BLOCK_COLORS.blue,
    };

    const page: Page = {
      id: nanoid(),
      name: title,
      blocks: [{ ...calBlock, id: nanoid() }],
    };

    if (pendingAddPage) {
      setPages(prev => [...prev, page]);
      setCurrentPageIndex(pages.length);
      setPendingAddPage(false);
      toast({ title: 'Page added', description: `Calendar page "${title}" created.` });
    } else {
      setPages([page]);
      setCurrentPageIndex(0);
      toast({ title: 'Project started', description: `Calendar "${title}" created.` });
    }

    setIsCalendarConfigOpen(false);
    setIsTemplateDialogOpen(false);
    setCalendarConfigPendingTemplate(null);
  }, [calendarView, calendarWeekStartDate, calendarStartHour, calendarEndHour, calendarShowWeekends, calendarMonth, calendarYear, canvasSize, pendingAddPage, pages.length, toast]);

  const handleAddBlock = useCallback((template: BlockTemplate) => {
    const existingPositions = blocks.map(b => b.position);
    let x = 20;
    let y = 20;
    
    while (existingPositions.some(p => 
      Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50
    )) {
      x += 40;
      y += 40;
      if (x > 400) { x = 20; }
      if (y > 400) { y = 20; }
    }

    const newBlock: Block = {
      id: nanoid(),
      type: template.type,
      title: template.title,
      icon: template.icon,
      position: { x, y },
      size: { ...template.defaultSize },
      data: JSON.parse(JSON.stringify(template.defaultData)),
      color: template.color,
    };

    updateCurrentPageBlocks(prev => [...prev, newBlock]);
    toast({
      title: 'Block added',
      description: `${template.title} added to ${currentPage.name}.`,
    });
  }, [blocks, currentPage, updateCurrentPageBlocks, toast]);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const templateIndexStr = e.dataTransfer.getData('application/block-template-index');
    if (!templateIndexStr) return;

    const templateIndex = parseInt(templateIndexStr, 10);
    const template = BLOCK_TEMPLATES[templateIndex];
    if (!template) return;

    const canvasEl = canvasWrapperRef.current;
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const GRID_SIZE = 20;
    let x = Math.round((e.clientX - rect.left - (template.defaultSize.width / 2)) / GRID_SIZE) * GRID_SIZE;
    let y = Math.round((e.clientY - rect.top - (template.defaultSize.height / 2)) / GRID_SIZE) * GRID_SIZE;
    x = Math.max(0, Math.min(x, canvasSize.width - template.defaultSize.width));
    y = Math.max(0, Math.min(y, canvasSize.height - template.defaultSize.height));

    const newBlock: Block = {
      id: nanoid(),
      type: template.type,
      title: template.title,
      icon: template.icon,
      position: { x, y },
      size: { ...template.defaultSize },
      data: JSON.parse(JSON.stringify(template.defaultData)),
      color: template.color,
    };

    updateCurrentPageBlocks(prev => [...prev, newBlock]);
  }, [canvasSize, updateCurrentPageBlocks]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleAddImageBlock = useCallback((imageData: ImageData) => {
    const existingPositions = blocks.map(b => b.position);
    let x = 20;
    let y = 20;
    
    while (existingPositions.some(p => 
      Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50
    )) {
      x += 40;
      y += 40;
      if (x > 400) { x = 20; }
      if (y > 400) { y = 20; }
    }

    const newBlock: Block = {
      id: nanoid(),
      type: 'image',
      title: 'Image',
      icon: 'Image',
      position: { x, y },
      size: { width: 200, height: 150 },
      data: imageData,
      color: BLOCK_COLORS.blue,
    };

    updateCurrentPageBlocks(prev => [...prev, newBlock]);
    toast({
      title: 'Image added',
      description: `Image added to ${currentPage.name}.`,
    });
  }, [blocks, currentPage, updateCurrentPageBlocks, toast]);

  const handleDragBlock = useCallback((id: string, position: { x: number; y: number }) => {
    updateCurrentPageBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, position } : block
    ));
  }, [updateCurrentPageBlocks]);

  const handleResizeBlock = useCallback((id: string, size: { width: number; height: number }) => {
    updateCurrentPageBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, size } : block
    ));
  }, [updateCurrentPageBlocks]);

  const handleUpdateBlock = useCallback((updatedBlock: Block) => {
    updateCurrentPageBlocks(prev => prev.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    ));
  }, [updateCurrentPageBlocks]);

  const handleDeleteBlock = useCallback((id: string) => {
    updateCurrentPageBlocks(prev => prev.filter(block => block.id !== id));
    toast({
      title: 'Block deleted',
      description: 'The block has been removed.',
    });
  }, [updateCurrentPageBlocks, toast]);

  const handleEditBlock = useCallback((id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      setEditingBlock(block);
      setIsEditorOpen(true);
    }
  }, [blocks]);

  const handleSaveBlock = useCallback((updatedBlock: Block) => {
    updateCurrentPageBlocks(prev => prev.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    ));
    toast({
      title: 'Changes saved',
      description: 'Your block has been updated.',
    });
  }, [updateCurrentPageBlocks, toast]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousBlocks = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(blocks))]);
    skipHistoryRef.current = true;
    setPages(prev => prev.map((page, idx) =>
      idx === currentPageIndex ? { ...page, blocks: previousBlocks } : page
    ));
    skipHistoryRef.current = false;
    setHasUnsavedChanges(true);
  }, [undoStack, blocks, currentPageIndex]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextBlocks = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(blocks))]);
    skipHistoryRef.current = true;
    setPages(prev => prev.map((page, idx) =>
      idx === currentPageIndex ? { ...page, blocks: nextBlocks } : page
    ));
    skipHistoryRef.current = false;
    setHasUnsavedChanges(true);
  }, [redoStack, blocks, currentPageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, [currentPageIndex]);

  const handleClearCanvas = useCallback(() => {
    updateCurrentPageBlocks(() => []);
    toast({
      title: 'Page cleared',
      description: 'All blocks have been removed from this page.',
    });
  }, [updateCurrentPageBlocks, toast]);

  const handleAddPage = useCallback(() => {
    setPendingAddPage(true);
    setIsTemplateDialogOpen(true);
  }, []);

  const handleDeletePage = useCallback(() => {
    if (pages.length <= 1) {
      toast({
        title: 'Cannot delete',
        description: 'You need at least one page.',
        variant: 'destructive',
      });
      return;
    }
    
    setPages(prev => prev.filter((_, idx) => idx !== currentPageIndex));
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
    toast({
      title: 'Page deleted',
      description: 'The page has been removed.',
    });
  }, [pages.length, currentPageIndex, toast]);

  const handleRenamePage = useCallback(() => {
    setNewPageName(currentPage.name);
    setIsRenameDialogOpen(true);
  }, [currentPage]);

  const handleSavePageName = useCallback(() => {
    if (newPageName.trim()) {
      setPages(prev => prev.map((page, idx) =>
        idx === currentPageIndex ? { ...page, name: newPageName.trim() } : page
      ));
      setIsRenameDialogOpen(false);
      toast({
        title: 'Page renamed',
        description: `Page renamed to "${newPageName.trim()}".`,
      });
    }
  }, [newPageName, currentPageIndex, toast]);

  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    setIsExportDialogOpen(true);
    setExportImage(null);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: '#f3f4f6',
        quality: 1,
        pixelRatio: 2,
      });
      setExportImage(dataUrl);
    } catch (err) {
      console.error('Failed to export:', err);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your slide.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  const handleTakeSnapshot = useCallback(async () => {
    if (!canvasRef.current) return;
    if (!currentProjectId) {
      toast({
        title: 'Save project first',
        description: 'Please save your project to the cloud before taking a snapshot.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: '#f3f4f6',
        quality: 1,
        pixelRatio: 2,
      });

      const snapshotName = `${projectName} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      createSnapshotMutation.mutate({ name: snapshotName, imageData: dataUrl });
    } catch (err) {
      console.error('Failed to take snapshot:', err);
      toast({
        title: 'Snapshot failed',
        description: 'There was an error taking a snapshot of your slide.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [canvasRef, currentProjectId, projectName, createSnapshotMutation, toast]);

  const handleExportJSON = useCallback(() => {
    const project: SlideProject = {
      version: '1.0',
      name: projectName,
      pages: pages,
      canvasSize: canvasSize,
      globalFooter: footerSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = `slide-project-${Date.now()}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Project exported',
      description: 'Your slide project has been downloaded as JSON.',
    });
  }, [pages, canvasSize, toast]);

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (!validateProject(parsed)) {
          throw new Error('Invalid project structure');
        }

        setPages(parsed.pages);
        setCurrentPageIndex(0);
        if (parsed.canvasSize) {
          setCanvasSize(parsed.canvasSize);
        }
        if (parsed.globalFooter) {
          setFooterSettings(parsed.globalFooter);
        } else {
          setFooterSettings({ ...DEFAULT_FOOTER_SETTINGS });
        }
        if (parsed.name) {
          setProjectName(parsed.name);
        }
        setCurrentProjectId(null);
        setHasUnsavedChanges(true);
        setIsTemplateDialogOpen(false);
        
        toast({
          title: 'Project imported',
          description: `Loaded ${parsed.pages.length} page(s) from "${file.name}".`,
        });
      } catch (err) {
        console.error('Failed to import:', err);
        toast({
          title: 'Import failed',
          description: 'The file format is invalid or corrupted.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  }, [toast]);

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handleCanvasSizeChange = (sizeIndex: string) => {
    const idx = parseInt(sizeIndex);
    if (!isNaN(idx) && idx >= 0 && idx < CANVAS_SIZES.length) {
      setCanvasSize(CANVAS_SIZES[idx]);
    }
  };

  const handleApplyThemeColor = useCallback((hue: number) => {
    const scale = generateMonochromaticScale(hue);
    const scaleValues = Object.values(scale);
    const pickColor = (idx: number) => scaleValues[idx % scaleValues.length];

    setPages(prev => prev.map(page => ({
      ...page,
      blocks: page.blocks.map((block, bi) => {
        if (block.type === 'text' || block.type === 'image') return block;
        const newColor = pickColor(bi);
        let newData = block.data;
        if (Array.isArray(block.data)) {
          newData = (block.data as ChartDataPoint[]).map((item, i) => ({
            ...item,
            color: pickColor(i),
          }));
        } else if (block.data && typeof block.data === 'object' && 'months' in block.data) {
          const pData = block.data as PipelineData;
          let oppIdx = 0;
          newData = {
            ...pData,
            months: pData.months.map(m => ({
              ...m,
              opportunities: m.opportunities.map(o => ({
                ...o,
                color: pickColor(oppIdx++),
              })),
            })),
          } as PipelineData;
        } else if (block.data && typeof block.data === 'object' && 'stages' in block.data) {
          const fData = block.data as FunnelData;
          newData = {
            ...fData,
            stages: fData.stages.map((s, i) => ({ ...s, color: pickColor(i) })),
          } as FunnelData;
        } else if (block.data && typeof block.data === 'object' && 'events' in block.data) {
          const tData = block.data as TimelineData;
          newData = {
            ...tData,
            events: tData.events.map((ev, i) => ({ ...ev, color: ev.color ? pickColor(i) : ev.color })),
            segments: tData.segments.map((s, i) => ({ ...s, color: s.color ? pickColor(i) : s.color })),
          } as TimelineData;
        } else if (block.data && typeof block.data === 'object' && 'headerColor' in block.data) {
          const tableData = block.data as TableData;
          newData = { ...tableData, headerColor: pickColor(0) } as TableData;
        }
        return { ...block, color: newColor, data: newData };
      }),
    })));
    setHasUnsavedChanges(true);
    toast({
      title: 'Theme applied',
      description: 'All block colors have been updated to the new theme.',
    });
  }, [toast]);

  const totalBlocks = pages.reduce((sum, page) => sum + page.blocks.length, 0);

  const renderCalendarConfigDialog = () => (
    <Dialog open={isCalendarConfigOpen} onOpenChange={(open) => { if (!open) setIsCalendarConfigOpen(false); }}>
      <DialogContent className="max-w-md" data-testid="calendar-config-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Configure Calendar</span>
          </DialogTitle>
          <DialogDescription>Choose your calendar view and date settings.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">View Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['week', 'month', 'year'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCalendarView(v)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${calendarView === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                  data-testid={`button-cal-config-view-${v}`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {calendarView === 'week' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Week starting (Monday)</label>
                <input
                  type="date"
                  value={calendarWeekStartDate}
                  onChange={e => {
                    const d = new Date(e.target.value || new Date().toISOString());
                    const diff = (d.getDay() + 6) % 7;
                    d.setDate(d.getDate() - diff);
                    setCalendarWeekStartDate(d.toISOString().split('T')[0]);
                  }}
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                  data-testid="input-cal-config-week"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start hour</label>
                  <input
                    type="number"
                    min={0}
                    max={22}
                    value={calendarStartHour}
                    onChange={e => setCalendarStartHour(Math.min(parseInt(e.target.value) || 0, calendarEndHour - 1))}
                    className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                    data-testid="input-cal-config-start-hour"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End hour</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={calendarEndHour}
                    onChange={e => setCalendarEndHour(Math.max(parseInt(e.target.value) || 24, calendarStartHour + 1))}
                    className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                    data-testid="input-cal-config-end-hour"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="cal-cfg-weekends"
                  type="checkbox"
                  checked={calendarShowWeekends}
                  onChange={e => setCalendarShowWeekends(e.target.checked)}
                  className="w-4 h-4"
                  data-testid="checkbox-cal-config-weekends"
                />
                <label htmlFor="cal-cfg-weekends" className="text-sm">Show weekends</label>
              </div>
            </>
          )}

          {calendarView === 'month' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <select
                  value={calendarMonth}
                  onChange={e => setCalendarMonth(parseInt(e.target.value))}
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                  data-testid="select-cal-config-month"
                >
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <input
                  type="number"
                  value={calendarYear}
                  onChange={e => setCalendarYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min={2020}
                  max={2050}
                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                  data-testid="input-cal-config-year-month"
                />
              </div>
            </div>
          )}

          {calendarView === 'year' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <input
                type="number"
                value={calendarYear}
                onChange={e => setCalendarYear(parseInt(e.target.value) || new Date().getFullYear())}
                min={2020}
                max={2050}
                className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                data-testid="input-cal-config-year"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCalendarConfigOpen(false)} data-testid="button-cal-config-cancel">
            Cancel
          </Button>
          <Button onClick={handleConfirmCalendarConfig} data-testid="button-cal-config-confirm">
            Create Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (pages.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-background" data-testid="slide-designer">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
          data-testid="input-import-file"
        />
        
        <Dialog open={isTemplateDialogOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" data-testid="template-dialog">
            <DialogHeader>
              <DialogTitle className="text-xl">Get Started</DialogTitle>
              <DialogDescription>Continue with an existing project or create a new one from a template.</DialogDescription>
            </DialogHeader>

            {projects.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Your Projects</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[140px] overflow-y-auto pr-2">
                  {projects.slice(0, 6).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleLoadProject(project)}
                      className="p-3 rounded-lg border border-border bg-card hover-elevate active-elevate-2 text-left transition-all"
                      data-testid={`project-${project.id}`}
                    >
                      <div className="font-medium text-sm text-foreground truncate">{project.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(project.updatedAt!).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
                {projects.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setIsTemplateDialogOpen(false);
                      setIsProjectsDialogOpen(true);
                    }}
                    data-testid="button-view-all-projects"
                  >
                    View all {projects.length} projects
                  </Button>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-primary" />
                <h3 className="font-medium">New Project from Template</h3>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Canvas Size</label>
                <Select
                  value={CANVAS_SIZES.findIndex(s => s.width === canvasSize.width && s.height === canvasSize.height).toString()}
                  onValueChange={handleCanvasSizeChange}
                >
                  <SelectTrigger className="w-full max-w-xs" data-testid="select-canvas-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANVAS_SIZES.map((size, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {size.name} ({size.width}x{size.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="overflow-y-auto max-h-[35vh] pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SLIDE_TEMPLATES.map((template) => {
                    const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[template.icon] || LucideIcons.File;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="p-4 rounded-xl border border-border bg-card hover-elevate active-elevate-2 text-left transition-all"
                        data-testid={`template-${template.id}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.category}</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        {template.blocks.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              <Button variant="outline" onClick={handleImportJSON} data-testid="button-import-existing">
                <Upload className="w-4 h-4 mr-2" />
                Import JSON File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {renderCalendarConfigDialog()}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="slide-designer">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
        data-testid="input-import-file"
      />

      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Slide Designer</h1>
          <Input
            value={projectName}
            onChange={(e) => { setProjectName(e.target.value); setHasUnsavedChanges(true); }}
            className="w-40 h-7 text-sm"
            data-testid="input-project-name"
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground">unsaved</span>
          )}
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {pages.length} page{pages.length !== 1 ? 's' : ''} · {totalBlocks} block{totalBlocks !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProjectsDialogOpen(true)}
            data-testid="button-projects"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </Button>
          
          <Button
            size="sm"
            onClick={handleSaveToCloud}
            disabled={pages.length === 0 || saveProjectMutation.isPending}
            data-testid="button-save-cloud"
          >
            {saveProjectMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsDialogOpen(true)}
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleTakeSnapshot}
            disabled={blocks.length === 0 || createSnapshotMutation.isPending || !currentProjectId}
            title={!currentProjectId ? "Save project to cloud first" : "Take snapshot"}
            data-testid="button-take-snapshot"
          >
            {createSnapshotMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </Button>

          {currentProjectId && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSnapshotHistoryOpen(true)}
              title="View snapshot history"
              data-testid="button-snapshot-history"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-file-menu">
                <FileJson className="w-4 h-4 mr-2" />
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleNewProject} data-testid="menu-new-project">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleImportJSON} data-testid="menu-import-json">
                <Upload className="w-4 h-4 mr-2" />
                Import Project (JSON)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON} data-testid="menu-export-json">
                <FileJson className="w-4 h-4 mr-2" />
                Export Project (JSON)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPNG} disabled={blocks.length === 0} data-testid="menu-export-png">
                <Image className="w-4 h-4 mr-2" />
                Export Current Page (PNG)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo (Ctrl+Z)"
              data-testid="button-undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Shift+Z)"
              data-testid="button-redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCanvas}
            disabled={blocks.length === 0}
            data-testid="button-clear-canvas"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Page
          </Button>
          <Button
            size="sm"
            onClick={handleExportPNG}
            disabled={blocks.length === 0}
            data-testid="button-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PNG
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-user-menu">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm max-w-[100px] truncate">{user?.firstName || user?.email || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild data-testid="menu-terms">
                <a href="/terms" target="_blank">
                  <FileText className="w-4 h-4 mr-2" />
                  Terms & Conditions
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild data-testid="menu-privacy">
                <a href="/privacy" target="_blank">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteAccountDialogOpen(true)}
                className="text-destructive"
                data-testid="menu-delete-account"
              >
                <UserX className="w-4 h-4 mr-2" />
                Delete Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} data-testid="menu-logout">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-12 border-b border-border bg-card/50 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPageIndex === 0}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <button
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={handleRenamePage}
                data-testid="button-page-name"
              >
                {currentPage.name}
              </button>
              
              <span className="text-xs text-muted-foreground">
                ({currentPageIndex + 1} of {pages.length})
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPageIndex === pages.length - 1}
                data-testid="button-next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddPage}
                data-testid="button-add-page"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Page
              </Button>
              {pages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeletePage}
                  className="text-destructive hover:text-destructive"
                  data-testid="button-delete-page"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Page
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto bg-muted/30">
            <div 
              className="mx-auto"
              style={{ width: canvasSize.width, height: canvasSize.height }}
              ref={canvasWrapperRef}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            >
              <Card className="w-full h-full overflow-hidden shadow-lg" data-testid="canvas-container">
                <SlideCanvas
                  ref={canvasRef}
                  blocks={blocks}
                  onDragBlock={handleDragBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onEditBlock={handleEditBlock}
                  onResizeBlock={handleResizeBlock}
                  onUpdateBlock={handleUpdateBlock}
                  onInteractionStart={saveDragStartSnapshot}
                  onInteractionEnd={commitDragSnapshot}
                  isExporting={isExporting}
                  canvasSize={canvasSize}
                  footer={footerSettings}
                />
              </Card>
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-border bg-card shrink-0">
          <BlockPicker onAddBlock={handleAddBlock} onAddImageBlock={handleAddImageBlock} />
        </div>
      </div>

      <BlockEditor
        block={editingBlock}
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingBlock(null);
        }}
        onSave={handleSaveBlock}
      />

      <ExportDialog
        open={isExportDialogOpen}
        onClose={() => {
          setIsExportDialogOpen(false);
          setExportImage(null);
        }}
        imageData={exportImage}
      />

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="max-w-sm" data-testid="rename-page-dialog">
          <DialogHeader>
            <DialogTitle>Rename Page</DialogTitle>
            <DialogDescription>Enter a new name for this page.</DialogDescription>
          </DialogHeader>
          <Input
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Page name"
            onKeyDown={(e) => e.key === 'Enter' && handleSavePageName()}
            data-testid="input-page-name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePageName} data-testid="button-save-page-name">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" data-testid="settings-dialog">
          <DialogHeader>
            <DialogTitle>Slide Settings</DialogTitle>
            <DialogDescription>Configure canvas size and footer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Canvas Size</label>
              <Select
                value={CANVAS_SIZES.findIndex(s => s.width === canvasSize.width && s.height === canvasSize.height).toString()}
                onValueChange={handleCanvasSizeChange}
              >
                <SelectTrigger data-testid="settings-canvas-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANVAS_SIZES.map((size, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {size.name} ({size.width}x{size.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {canvasSize.width} x {canvasSize.height} pixels
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="mb-4">
                <label className="text-sm font-medium mb-3 block">Theme Color</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Apply a monochromatic color scheme to all blocks
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { hue: 217, label: 'Blue', preview: 'hsl(217, 85%, 55%)' },
                    { hue: 160, label: 'Green', preview: 'hsl(160, 85%, 55%)' },
                    { hue: 280, label: 'Purple', preview: 'hsl(280, 85%, 55%)' },
                    { hue: 0, label: 'Red', preview: 'hsl(0, 85%, 55%)' },
                    { hue: 25, label: 'Orange', preview: 'hsl(25, 85%, 55%)' },
                    { hue: 175, label: 'Teal', preview: 'hsl(175, 85%, 55%)' },
                    { hue: 330, label: 'Pink', preview: 'hsl(330, 85%, 55%)' },
                    { hue: 43, label: 'Gold', preview: 'hsl(43, 85%, 55%)' },
                    { hue: 200, label: 'Cyan', preview: 'hsl(200, 85%, 55%)' },
                    { hue: 260, label: 'Indigo', preview: 'hsl(260, 85%, 55%)' },
                  ].map(({ hue, label, preview }) => (
                    <button
                      key={hue}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground transition-all hover:scale-110"
                      style={{ backgroundColor: preview }}
                      title={label}
                      onClick={() => handleApplyThemeColor(hue)}
                      data-testid={`theme-color-${label.toLowerCase()}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Custom hue:</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    defaultValue="217"
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, hsl(0,85%,55%), hsl(60,85%,55%), hsl(120,85%,55%), hsl(180,85%,55%), hsl(240,85%,55%), hsl(300,85%,55%), hsl(360,85%,55%))',
                    }}
                    onChange={(e) => handleApplyThemeColor(parseInt(e.target.value))}
                    data-testid="theme-color-slider"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tip: Start a new project from a template to restore default colors.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Footer</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerSettings.enabled}
                    onChange={(e) => {
                      setFooterSettings({ ...footerSettings, enabled: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                    data-testid="toggle-footer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {footerSettings.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Footer Text</label>
                    <Input
                      value={footerSettings.text}
                      onChange={(e) => {
                        setFooterSettings({ ...footerSettings, text: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="e.g., Company Name - Confidential"
                      data-testid="input-footer-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Height (px)</label>
                      <Input
                        type="number"
                        value={footerSettings.height}
                        onChange={(e) => {
                          setFooterSettings({ ...footerSettings, height: parseInt(e.target.value) || 60 });
                          setHasUnsavedChanges(true);
                        }}
                        min={30}
                        max={120}
                        data-testid="input-footer-height"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Logo Position</label>
                      <Select
                        value={footerSettings.logoPosition}
                        onValueChange={(value: 'left' | 'center' | 'right') => {
                          setFooterSettings({ ...footerSettings, logoPosition: value });
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger data-testid="select-logo-position">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={footerSettings.backgroundColor}
                          onChange={(e) => {
                            setFooterSettings({ ...footerSettings, backgroundColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-8 h-8 rounded border cursor-pointer"
                          data-testid="input-footer-bg-color"
                        />
                        <Input
                          value={footerSettings.backgroundColor}
                          onChange={(e) => {
                            setFooterSettings({ ...footerSettings, backgroundColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={footerSettings.textColor}
                          onChange={(e) => {
                            setFooterSettings({ ...footerSettings, textColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-8 h-8 rounded border cursor-pointer"
                          data-testid="input-footer-text-color"
                        />
                        <Input
                          value={footerSettings.textColor}
                          onChange={(e) => {
                            setFooterSettings({ ...footerSettings, textColor: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Logo</label>
                    {footerSettings.logoSrc ? (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                        <img
                          src={footerSettings.logoSrc}
                          alt="Footer logo"
                          className="h-8 object-contain"
                          data-testid="footer-logo-preview"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFooterSettings({ ...footerSettings, logoSrc: undefined });
                            setHasUnsavedChanges(true);
                          }}
                          data-testid="button-remove-logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={footerLogoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFooterSettings({ ...footerSettings, logoSrc: event.target?.result as string });
                                setHasUnsavedChanges(true);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          data-testid="input-footer-logo"
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => footerLogoInputRef.current?.click()}
                          data-testid="button-upload-logo"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTemplateDialogOpen && pendingAddPage} onOpenChange={(open) => {
        if (!open) {
          setPendingAddPage(false);
          setIsTemplateDialogOpen(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" data-testid="add-page-template-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Page</DialogTitle>
            <DialogDescription>Choose a template for your new page.</DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[50vh] pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SLIDE_TEMPLATES.map((template) => {
                const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[template.icon] || LucideIcons.File;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 rounded-xl border border-border bg-card hover-elevate active-elevate-2 text-left transition-all"
                    data-testid={`add-template-${template.id}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.category}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                    {template.blocks.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPendingAddPage(false);
              setIsTemplateDialogOpen(false);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProjectsDialogOpen} onOpenChange={setIsProjectsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden" data-testid="projects-dialog">
          <DialogHeader>
            <DialogTitle>Your Projects</DialogTitle>
            <DialogDescription>Load or manage your saved projects.</DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[50vh]">
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved projects yet.</p>
                <p className="text-sm">Create a project and save it to see it here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'recently'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadProject(project)}
                        data-testid={`button-load-project-${project.id}`}
                      >
                        Open
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Delete this project?')) {
                            deleteProjectMutation.mutate(project.id);
                            if (currentProjectId === project.id) {
                              setCurrentProjectId(null);
                            }
                          }
                        }}
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button variant="outline" onClick={handleNewProject} data-testid="button-new-project-dialog">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Button onClick={() => setIsProjectsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSnapshotHistoryOpen} onOpenChange={setIsSnapshotHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden" data-testid="snapshot-history-dialog">
          <DialogHeader>
            <DialogTitle>Snapshot History</DialogTitle>
            <DialogDescription>
              View and manage historical snapshots of your project. Take weekly snapshots to track progress over time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            {isLoadingSnapshots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : snapshots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No snapshots yet.</p>
                <p className="text-sm">Take a snapshot to save a visual record of your project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="rounded-lg border border-border overflow-hidden bg-card"
                    data-testid={`snapshot-${snapshot.id}`}
                  >
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={snapshot.imageData}
                        alt={snapshot.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-sm truncate">{snapshot.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Unknown date'}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `${snapshot.name.replace(/[^a-z0-9]/gi, '-')}.png`;
                            link.href = snapshot.imageData;
                            link.click();
                          }}
                          data-testid={`button-download-snapshot-${snapshot.id}`}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Delete this snapshot?')) {
                              deleteSnapshotMutation.mutate(snapshot.id);
                            }
                          }}
                          data-testid={`button-delete-snapshot-${snapshot.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleTakeSnapshot}
              disabled={blocks.length === 0 || createSnapshotMutation.isPending}
              data-testid="button-take-snapshot-dialog"
            >
              {createSnapshotMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Take New Snapshot
            </Button>
            <Button onClick={() => setIsSnapshotHistoryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your projects, snapshots, and data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete your account? This will remove:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc pl-6 space-y-1">
              <li>Your user profile and account information</li>
              <li>All saved slide projects</li>
              <li>All project snapshots and history</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteAccountDialogOpen(false)}
              data-testid="button-cancel-delete-account"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAccountMutation.mutate()}
              disabled={deleteAccountMutation.isPending}
              data-testid="button-confirm-delete-account"
            >
              {deleteAccountMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserX className="w-4 h-4 mr-2" />
              )}
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderCalendarConfigDialog()}
    </div>
  );
}
