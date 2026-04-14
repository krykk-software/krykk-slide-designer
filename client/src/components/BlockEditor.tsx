import { Block, StatData, SimpleValueData, ChartDataPoint, TextData, GanttData, GanttTask, ImageData, TableData, TimelineData, TimelineEvent, TimelineSegment, PipelineData, PipelineMonth, PipelineOpportunity, FunnelData, FunnelStage, CalendarData, CalendarEventData, CalendarEventItem, CALENDAR_EVENT_TYPES, BLOCK_COLORS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface BlockEditorProps {
  block: Block | null;
  open: boolean;
  onClose: () => void;
  onSave: (block: Block) => void;
}

const colorOptions = Object.entries(BLOCK_COLORS);

export function BlockEditor({ block, open, onClose, onSave }: BlockEditorProps) {
  const [editedBlock, setEditedBlock] = useState<Block | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync editedBlock with block prop when dialog opens
  useEffect(() => {
    if (open && block) {
      setEditedBlock({ ...block, data: JSON.parse(JSON.stringify(block.data)) });
    }
  }, [open, block]);

  const handleSave = () => {
    if (editedBlock) {
      onSave(editedBlock);
      onClose();
    }
  };

  const handleClose = () => {
    setEditedBlock(null);
    onClose();
  };

  const updateStatData = (field: keyof StatData, value: number | string) => {
    if (!editedBlock) return;
    const newData = { ...(editedBlock.data as StatData), [field]: value };
    setEditedBlock({ ...editedBlock, data: newData });
  };

  const updateChartData = (index: number, field: keyof ChartDataPoint, value: string | number) => {
    if (!editedBlock) return;
    const data = [...(editedBlock.data as ChartDataPoint[])];
    data[index] = { ...data[index], [field]: value };
    setEditedBlock({ ...editedBlock, data });
  };

  const addChartDataPoint = () => {
    if (!editedBlock) return;
    const data = [...(editedBlock.data as ChartDataPoint[])];
    const colorIndex = data.length % colorOptions.length;
    data.push({ label: 'New Item', value: 0, color: colorOptions[colorIndex][1] });
    setEditedBlock({ ...editedBlock, data });
  };

  const removeChartDataPoint = (index: number) => {
    if (!editedBlock) return;
    const data = [...(editedBlock.data as ChartDataPoint[])];
    data.splice(index, 1);
    setEditedBlock({ ...editedBlock, data });
  };

  const updateTextData = (field: keyof TextData, value: string | number) => {
    if (!editedBlock) return;
    const newData = { ...(editedBlock.data as TextData), [field]: value };
    setEditedBlock({ ...editedBlock, data: newData });
  };

  const updateGanttData = (field: keyof GanttData, value: number | string | GanttTask[]) => {
    if (!editedBlock) return;
    const newData = { ...(editedBlock.data as GanttData), [field]: value };
    setEditedBlock({ ...editedBlock, data: newData });
  };

  const updateGanttTask = (index: number, field: keyof GanttTask, value: string | number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as GanttData;
    const tasks = [...data.tasks];
    tasks[index] = { ...tasks[index], [field]: value };
    setEditedBlock({ ...editedBlock, data: { ...data, tasks } });
  };

  const addGanttTask = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as GanttData;
    if (data.tasks.length >= 20) return;
    const colorIndex = data.tasks.length % colorOptions.length;
    const lastTask = data.tasks[data.tasks.length - 1];
    const newStartDay = lastTask ? lastTask.startDay + lastTask.duration : 1;
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      startDay: newStartDay,
      duration: 3,
      color: colorOptions[colorIndex][1],
      section: lastTask?.section || 'Tasks',
    };
    setEditedBlock({ ...editedBlock, data: { ...data, tasks: [...data.tasks, newTask] } });
  };

  const removeGanttTask = (index: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as GanttData;
    const tasks = [...data.tasks];
    tasks.splice(index, 1);
    setEditedBlock({ ...editedBlock, data: { ...data, tasks } });
  };

  const updateTableData = (newData: Partial<TableData>) => {
    if (!editedBlock) return;
    const currentData = editedBlock.data as TableData;
    setEditedBlock({ ...editedBlock, data: { ...currentData, ...newData } });
  };

  const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TableData;
    const newRows = data.rows.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : [...row]
    );
    updateTableData({ rows: newRows });
  };

  const updateTableColumn = (colIndex: number, value: string) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TableData;
    const newColumns = data.columns.map((col, ci) => (ci === colIndex ? value : col));
    updateTableData({ columns: newColumns });
  };

  const addTableRow = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as TableData;
    const newRow = data.columns.map(() => '');
    updateTableData({ rows: [...data.rows, newRow] });
  };

  const removeTableRow = (rowIndex: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TableData;
    if (data.rows.length <= 1) return;
    const newRows = data.rows.filter((_, i) => i !== rowIndex);
    updateTableData({ rows: newRows });
  };

  const normalizeRows = (rows: string[][], colCount: number): string[][] => {
    return rows.map(row => {
      if (row.length < colCount) return [...row, ...Array(colCount - row.length).fill('')];
      if (row.length > colCount) return row.slice(0, colCount);
      return [...row];
    });
  };

  const addTableColumn = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as TableData;
    const newColumns = [...data.columns, `Column ${data.columns.length + 1}`];
    const newRows = normalizeRows(data.rows, newColumns.length);
    updateTableData({ columns: newColumns, rows: newRows });
  };

  const removeTableColumn = (colIndex: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TableData;
    if (data.columns.length <= 1) return;
    const newColumns = data.columns.filter((_, i) => i !== colIndex);
    const newRows = data.rows.map(row => row.filter((_, i) => i !== colIndex));
    updateTableData({ columns: newColumns, rows: normalizeRows(newRows, newColumns.length) });
  };

  const updateImageData = (field: keyof ImageData, value: string) => {
    if (!editedBlock) return;
    const newData = { ...(editedBlock.data as ImageData), [field]: value };
    setEditedBlock({ ...editedBlock, data: newData });
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedBlock) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        updateImageData('src', src);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTimelineData = (updates: Partial<TimelineData>) => {
    if (!editedBlock) return;
    const currentData = editedBlock.data as TimelineData;
    setEditedBlock({ ...editedBlock, data: { ...currentData, ...updates } });
  };

  const updateTimelineEvent = (index: number, field: keyof TimelineEvent, value: string | number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TimelineData;
    const events = [...data.events];
    events[index] = { ...events[index], [field]: value };
    setEditedBlock({ ...editedBlock, data: { ...data, events } });
  };

  const addTimelineEvent = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as TimelineData;
    const colorIndex = data.events.length % colorOptions.length;
    const newEvent: TimelineEvent = {
      id: `ev-${Date.now()}`,
      name: 'New Event',
      location: 'TBD',
      startDate: data.startMonth + '-15',
      endDate: data.startMonth + '-16',
      color: colorOptions[colorIndex][1],
      segment: data.segments[0]?.name || '',
    };
    updateTimelineData({ events: [...data.events, newEvent] });
  };

  const removeTimelineEvent = (index: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TimelineData;
    const events = [...data.events];
    events.splice(index, 1);
    updateTimelineData({ events });
  };

  const updateTimelineSegment = (index: number, field: keyof TimelineSegment, value: string) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TimelineData;
    const segments = [...data.segments];
    segments[index] = { ...segments[index], [field]: value };
    setEditedBlock({ ...editedBlock, data: { ...data, segments } });
  };

  const addTimelineSegment = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as TimelineData;
    const colorIndex = data.segments.length % colorOptions.length;
    const newSegment: TimelineSegment = {
      id: `seg-${Date.now()}`,
      name: 'New Segment',
      color: colorOptions[colorIndex][1],
    };
    updateTimelineData({ segments: [...data.segments, newSegment] });
  };

  const removeTimelineSegment = (index: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as TimelineData;
    const segments = [...data.segments];
    segments.splice(index, 1);
    updateTimelineData({ segments });
  };

  const updatePipelineData = (updates: Partial<PipelineData>) => {
    if (!editedBlock) return;
    const currentData = editedBlock.data as PipelineData;
    setEditedBlock({ ...editedBlock, data: { ...currentData, ...updates } });
  };

  const updatePipelineOpp = (monthIdx: number, oppIdx: number, field: keyof PipelineOpportunity, value: string | number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as PipelineData;
    const months = data.months.map((m, mi) => {
      if (mi !== monthIdx) return m;
      const opps = m.opportunities.map((o, oi) => {
        if (oi !== oppIdx) return o;
        return { ...o, [field]: value };
      });
      return { ...m, opportunities: opps };
    });
    updatePipelineData({ months });
  };

  const addPipelineMonth = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as PipelineData;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const nextMonth = monthNames[(data.months.length) % 12];
    updatePipelineData({ months: [...data.months, { month: nextMonth, opportunities: [] }] });
  };

  const removePipelineMonth = (monthIdx: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as PipelineData;
    if (data.months.length <= 1) return;
    updatePipelineData({ months: data.months.filter((_, i) => i !== monthIdx) });
  };

  const addPipelineOpp = (monthIdx: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as PipelineData;
    const months = data.months.map((m, mi) => {
      if (mi !== monthIdx) return m;
      const colorIndex = m.opportunities.length % colorOptions.length;
      return {
        ...m,
        opportunities: [...m.opportunities, {
          id: `opp-${Date.now()}`,
          name: 'New Opportunity',
          amount: 0,
          color: colorOptions[colorIndex][1],
        }],
      };
    });
    updatePipelineData({ months });
  };

  const removePipelineOpp = (monthIdx: number, oppIdx: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as PipelineData;
    const months = data.months.map((m, mi) => {
      if (mi !== monthIdx) return m;
      return { ...m, opportunities: m.opportunities.filter((_, oi) => oi !== oppIdx) };
    });
    updatePipelineData({ months });
  };

  const updateFunnelStage = (index: number, field: keyof FunnelStage, value: string | number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as FunnelData;
    const stages = [...data.stages];
    stages[index] = { ...stages[index], [field]: value };
    setEditedBlock({ ...editedBlock, data: { ...data, stages } });
  };

  const addFunnelStage = () => {
    if (!editedBlock) return;
    const data = editedBlock.data as FunnelData;
    const colorIndex = data.stages.length % colorOptions.length;
    const newStage: FunnelStage = {
      label: 'New Stage',
      value: 0,
      color: colorOptions[colorIndex][1],
    };
    setEditedBlock({ ...editedBlock, data: { ...data, stages: [...data.stages, newStage] } });
  };

  const removeFunnelStage = (index: number) => {
    if (!editedBlock) return;
    const data = editedBlock.data as FunnelData;
    if (data.stages.length <= 2) return;
    const stages = [...data.stages];
    stages.splice(index, 1);
    setEditedBlock({ ...editedBlock, data: { ...data, stages } });
  };

  const renderEditor = () => {
    if (!editedBlock) return null;

    switch (editedBlock.type) {
      case 'stat': {
        const data = editedBlock.data as StatData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedBlock.title}
                onChange={(e) => setEditedBlock({ ...editedBlock, title: e.target.value })}
                data-testid="input-block-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Value</Label>
                <Input
                  id="current"
                  type="number"
                  value={data.current}
                  onChange={(e) => updateStatData('current', parseFloat(e.target.value) || 0)}
                  data-testid="input-current-value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previous">Previous Value</Label>
                <Input
                  id="previous"
                  type="number"
                  value={data.previous || 0}
                  onChange={(e) => updateStatData('previous', parseFloat(e.target.value) || 0)}
                  data-testid="input-previous-value"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prefix">Prefix (e.g. $)</Label>
                <Input
                  id="prefix"
                  value={data.prefix || ''}
                  onChange={(e) => updateStatData('prefix', e.target.value)}
                  placeholder="$"
                  data-testid="input-prefix"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix (e.g. %)</Label>
                <Input
                  id="suffix"
                  value={data.suffix || ''}
                  onChange={(e) => updateStatData('suffix', e.target.value)}
                  placeholder="%"
                  data-testid="input-suffix"
                />
              </div>
            </div>
          </div>
        );
      }

      case 'simple-value': {
        const data = editedBlock.data as SimpleValueData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedBlock.title}
                onChange={(e) => setEditedBlock({ ...editedBlock, title: e.target.value })}
                data-testid="input-simple-value-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={data.value}
                onChange={(e) => {
                  setEditedBlock({ ...editedBlock, data: { ...data, value: e.target.value } });
                }}
                data-testid="input-simple-value"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prefix">Prefix (e.g. $)</Label>
                <Input
                  id="prefix"
                  value={data.prefix || ''}
                  onChange={(e) => {
                    setEditedBlock({ ...editedBlock, data: { ...data, prefix: e.target.value } });
                  }}
                  placeholder="$"
                  data-testid="input-simple-prefix"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix (e.g. %)</Label>
                <Input
                  id="suffix"
                  value={data.suffix || ''}
                  onChange={(e) => {
                    setEditedBlock({ ...editedBlock, data: { ...data, suffix: e.target.value } });
                  }}
                  placeholder="%"
                  data-testid="input-simple-suffix"
                />
              </div>
            </div>
          </div>
        );
      }

      case 'pie-chart':
      case 'bar-chart': {
        const data = editedBlock.data as ChartDataPoint[];
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chart-title">Chart Title</Label>
              <Input
                id="chart-title"
                value={editedBlock.title}
                onChange={(e) => setEditedBlock({ ...editedBlock, title: e.target.value })}
                data-testid="input-chart-title"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Data Points</Label>
                <Button size="sm" variant="outline" onClick={addChartDataPoint} data-testid="button-add-data-point">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {data.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Input
                      value={point.label}
                      onChange={(e) => updateChartData(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1"
                      data-testid={`input-label-${index}`}
                    />
                    <Input
                      type="number"
                      value={point.value}
                      onChange={(e) => updateChartData(index, 'value', parseFloat(e.target.value) || 0)}
                      placeholder="Value"
                      className="w-24"
                      data-testid={`input-value-${index}`}
                    />
                    <div className="flex gap-1">
                      {colorOptions.slice(0, 4).map(([name, color]) => (
                        <button
                          key={name}
                          className={`w-5 h-5 rounded-full border-2 ${
                            point.color === color ? 'border-foreground' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateChartData(index, 'color', color)}
                          data-testid={`color-${name}-${index}`}
                        />
                      ))}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeChartDataPoint(index)}
                      disabled={data.length <= 1}
                      data-testid={`delete-data-point-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'text': {
        const data = editedBlock.data as TextData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Text Content</Label>
              <Input
                id="text-content"
                value={data.content}
                onChange={(e) => updateTextData('content', e.target.value)}
                data-testid="input-text-content"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={data.fontSize || 24}
                onChange={(e) => updateTextData('fontSize', parseInt(e.target.value) || 24)}
                min={12}
                max={72}
                data-testid="input-font-size"
              />
            </div>
          </div>
        );
      }

      case 'gantt': {
        const data = editedBlock.data as GanttData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gantt-title">Chart Title</Label>
              <Input
                id="gantt-title"
                value={editedBlock.title}
                onChange={(e) => setEditedBlock({ ...editedBlock, title: e.target.value })}
                data-testid="input-gantt-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-days">Total Days</Label>
              <Input
                id="total-days"
                type="number"
                value={data.totalDays}
                onChange={(e) => updateGanttData('totalDays', parseInt(e.target.value) || 30)}
                min={7}
                max={365}
                data-testid="input-total-days"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tasks ({data.tasks.length}/20)</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={addGanttTask}
                  disabled={data.tasks.length >= 20}
                  data-testid="button-add-task"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Task
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {data.tasks.map((task, index) => (
                  <div key={task.id} className="p-2 rounded-md bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={task.name}
                        onChange={(e) => updateGanttTask(index, 'name', e.target.value)}
                        placeholder="Task name"
                        className="flex-1"
                        data-testid={`input-task-name-${index}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeGanttTask(index)}
                        disabled={data.tasks.length <= 1}
                        data-testid={`delete-task-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px]">Start Day</Label>
                        <Input
                          type="number"
                          value={task.startDay}
                          onChange={(e) => updateGanttTask(index, 'startDay', parseInt(e.target.value) || 1)}
                          min={1}
                          data-testid={`input-start-day-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Duration</Label>
                        <Input
                          type="number"
                          value={task.duration}
                          onChange={(e) => updateGanttTask(index, 'duration', parseInt(e.target.value) || 1)}
                          min={1}
                          data-testid={`input-duration-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px]">Section</Label>
                        <Input
                          value={task.section || ''}
                          onChange={(e) => updateGanttTask(index, 'section', e.target.value)}
                          placeholder="Section"
                          data-testid={`input-section-${index}`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {colorOptions.map(([name, color]) => (
                        <button
                          key={name}
                          className={`w-5 h-5 rounded-full border-2 ${
                            task.color === color ? 'border-foreground' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateGanttTask(index, 'color', color)}
                          data-testid={`task-color-${name}-${index}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'table': {
        const data = editedBlock.data as TableData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table-title">Table Title</Label>
              <Input
                id="table-title"
                value={editedBlock.title}
                onChange={(e) => setEditedBlock({ ...editedBlock, title: e.target.value })}
                data-testid="input-table-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Header Color</Label>
                <div className="flex gap-1 flex-wrap">
                  {colorOptions.map(([name, color]) => (
                    <button
                      key={name}
                      className={`w-6 h-6 rounded-full border-2 ${
                        data.headerColor === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateTableData({ headerColor: color })}
                      data-testid={`table-header-color-${name}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Striped Rows</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.stripedRows ?? false}
                    onChange={(e) => updateTableData({ stripedRows: e.target.checked })}
                    className="w-4 h-4"
                    data-testid="input-striped-rows"
                  />
                  <span className="text-sm text-muted-foreground">Alternate row shading</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Columns ({data.columns.length})</Label>
                <Button size="sm" variant="outline" onClick={addTableColumn} data-testid="button-add-column">
                  <Plus className="w-4 h-4 mr-1" /> Column
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.columns.map((col, ci) => (
                  <div key={ci} className="flex items-center gap-1">
                    <Input
                      value={col}
                      onChange={(e) => updateTableColumn(ci, e.target.value)}
                      className="w-28"
                      data-testid={`input-column-${ci}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeTableColumn(ci)}
                      disabled={data.columns.length <= 1}
                      data-testid={`delete-column-${ci}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Rows ({data.rows.length})</Label>
                <Button size="sm" variant="outline" onClick={addTableRow} data-testid="button-add-row">
                  <Plus className="w-4 h-4 mr-1" /> Row
                </Button>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {data.rows.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-1 p-2 rounded-md bg-muted/50">
                    {row.map((cell, ci) => (
                      <Input
                        key={ci}
                        value={cell}
                        onChange={(e) => updateTableCell(ri, ci, e.target.value)}
                        placeholder={data.columns[ci]}
                        className="flex-1 text-xs"
                        data-testid={`input-cell-${ri}-${ci}`}
                      />
                    ))}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeTableRow(ri)}
                      disabled={data.rows.length <= 1}
                      data-testid={`delete-row-${ri}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'image': {
        const data = editedBlock.data as ImageData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Image</Label>
              {data.src ? (
                <div className="border border-border rounded-lg p-2 bg-muted/50">
                  <img
                    src={data.src}
                    alt={data.alt || 'Preview'}
                    className="max-h-32 mx-auto object-contain"
                    data-testid="image-preview"
                  />
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
                  No image selected
                </div>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageReplace}
              className="hidden"
              data-testid="input-replace-image"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => imageInputRef.current?.click()}
              data-testid="button-replace-image"
            >
              <Upload className="w-4 h-4 mr-2" />
              Replace Image
            </Button>

            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                value={data.alt || ''}
                onChange={(e) => updateImageData('alt', e.target.value)}
                placeholder="Describe the image"
                data-testid="input-image-alt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="object-fit">Image Fit</Label>
              <Select
                value={data.objectFit || 'contain'}
                onValueChange={(value) => updateImageData('objectFit', value)}
              >
                <SelectTrigger data-testid="select-object-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Contain (fit inside)</SelectItem>
                  <SelectItem value="cover">Cover (fill & crop)</SelectItem>
                  <SelectItem value="fill">Stretch to fill</SelectItem>
                  <SelectItem value="none">Original size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={editedBlock.size.width}
                  onChange={(e) => setEditedBlock({
                    ...editedBlock,
                    size: { ...editedBlock.size, width: parseInt(e.target.value) || 200 }
                  })}
                  min={50}
                  data-testid="input-image-width"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={editedBlock.size.height}
                  onChange={(e) => setEditedBlock({
                    ...editedBlock,
                    size: { ...editedBlock.size, height: parseInt(e.target.value) || 150 }
                  })}
                  min={50}
                  data-testid="input-image-height"
                />
              </div>
            </div>
          </div>
        );
      }

      case 'timeline': {
        const data = editedBlock.data as TimelineData;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Month</Label>
                <Input
                  type="month"
                  value={data.startMonth}
                  onChange={(e) => updateTimelineData({ startMonth: e.target.value })}
                  data-testid="input-timeline-start"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  value={data.durationMonths}
                  onChange={(e) => updateTimelineData({ durationMonths: Math.max(1, Math.min(12, parseInt(e.target.value) || 3)) })}
                  min={1}
                  max={12}
                  data-testid="input-timeline-duration"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Segments ({data.segments.length})</Label>
                <Button size="sm" variant="outline" onClick={addTimelineSegment} data-testid="button-add-segment">
                  <Plus className="w-4 h-4 mr-1" /> Segment
                </Button>
              </div>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {data.segments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2 p-1 rounded-md bg-muted/50">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <Input
                      value={seg.name}
                      onChange={(e) => updateTimelineSegment(i, 'name', e.target.value)}
                      className="flex-1 text-xs"
                      data-testid={`input-segment-name-${i}`}
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeTimelineSegment(i)} data-testid={`delete-segment-${i}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Events ({data.events.length})</Label>
                <Button size="sm" variant="outline" onClick={addTimelineEvent} data-testid="button-add-event">
                  <Plus className="w-4 h-4 mr-1" /> Event
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {data.events.map((event, i) => (
                  <div key={i} className="p-2 rounded-md bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                      <Input
                        value={event.name}
                        onChange={(e) => updateTimelineEvent(i, 'name', e.target.value)}
                        placeholder="Event name"
                        className="flex-1 text-xs"
                        data-testid={`input-event-name-${i}`}
                      />
                      <Button size="icon" variant="ghost" onClick={() => removeTimelineEvent(i)} data-testid={`delete-event-${i}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        value={event.location}
                        onChange={(e) => updateTimelineEvent(i, 'location', e.target.value)}
                        placeholder="Location"
                        className="text-xs"
                        data-testid={`input-event-location-${i}`}
                      />
                      <Select
                        value={event.segment || ''}
                        onValueChange={(v) => updateTimelineEvent(i, 'segment', v)}
                      >
                        <SelectTrigger className="text-xs" data-testid={`select-event-segment-${i}`}>
                          <SelectValue placeholder="Segment" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.segments.map((seg) => (
                            <SelectItem key={seg.id} value={seg.name}>{seg.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        type="date"
                        value={event.startDate}
                        onChange={(e) => updateTimelineEvent(i, 'startDate', e.target.value)}
                        className="text-xs"
                        data-testid={`input-event-start-${i}`}
                      />
                      <Input
                        type="date"
                        value={event.endDate}
                        onChange={(e) => updateTimelineEvent(i, 'endDate', e.target.value)}
                        className="text-xs"
                        data-testid={`input-event-end-${i}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        type="number"
                        value={event.cost ?? ''}
                        onChange={(e) => updateTimelineEvent(i, 'cost', parseFloat(e.target.value) || 0)}
                        placeholder="Cost"
                        className="text-xs"
                        data-testid={`input-event-cost-${i}`}
                      />
                      <Input
                        type="number"
                        value={event.attendees ?? ''}
                        onChange={(e) => updateTimelineEvent(i, 'attendees', parseInt(e.target.value) || 0)}
                        placeholder="Attendees"
                        className="text-xs"
                        data-testid={`input-event-attendees-${i}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'pipeline': {
        const data = editedBlock.data as PipelineData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Value Prefix</Label>
              <Input
                value={data.prefix || ''}
                onChange={(e) => updatePipelineData({ prefix: e.target.value })}
                placeholder="e.g. $"
                className="w-20"
                data-testid="input-pipeline-prefix"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Months ({data.months.length})</Label>
                <Button size="sm" variant="outline" onClick={addPipelineMonth} data-testid="button-add-pipeline-month">
                  <Plus className="w-4 h-4 mr-1" /> Month
                </Button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.months.map((month, mi) => (
                  <div key={mi} className="p-2 rounded-md bg-muted/50 space-y-2" data-testid={`pipeline-editor-month-${mi}`}>
                    <div className="flex items-center gap-2">
                      <Input
                        value={month.month}
                        onChange={(e) => {
                          const months = [...data.months];
                          months[mi] = { ...months[mi], month: e.target.value };
                          updatePipelineData({ months });
                        }}
                        className="flex-1 text-xs font-medium"
                        data-testid={`input-pipeline-month-name-${mi}`}
                      />
                      <Button size="icon" variant="ghost" onClick={() => removePipelineMonth(mi)} disabled={data.months.length <= 1} data-testid={`delete-pipeline-month-${mi}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs">Opportunities</Label>
                      <Button size="sm" variant="ghost" onClick={() => addPipelineOpp(mi)} data-testid={`button-add-opp-${mi}`}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {month.opportunities.map((opp, oi) => (
                      <div key={oi} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opp.color || '#3B82F6' }} />
                        <Input
                          value={opp.name}
                          onChange={(e) => updatePipelineOpp(mi, oi, 'name', e.target.value)}
                          placeholder="Name"
                          className="flex-1 text-xs"
                          data-testid={`input-opp-name-${mi}-${oi}`}
                        />
                        <Input
                          type="number"
                          value={opp.amount}
                          onChange={(e) => updatePipelineOpp(mi, oi, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="Amount"
                          className="w-20 text-xs"
                          data-testid={`input-opp-amount-${mi}-${oi}`}
                        />
                        <Button size="icon" variant="ghost" onClick={() => removePipelineOpp(mi, oi)} data-testid={`delete-opp-${mi}-${oi}`}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'funnel': {
        const data = editedBlock.data as FunnelData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Stages ({data.stages.length})</Label>
                <Button size="sm" variant="outline" onClick={addFunnelStage} data-testid="button-add-funnel-stage">
                  <Plus className="w-4 h-4 mr-1" /> Stage
                </Button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {data.stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50" data-testid={`funnel-editor-stage-${i}`}>
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <Input
                      value={stage.label}
                      onChange={(e) => updateFunnelStage(i, 'label', e.target.value)}
                      placeholder="Stage name"
                      className="flex-1 text-xs"
                      data-testid={`input-funnel-label-${i}`}
                    />
                    <Input
                      type="number"
                      value={stage.value}
                      onChange={(e) => updateFunnelStage(i, 'value', parseFloat(e.target.value) || 0)}
                      placeholder="Value"
                      className="w-24 text-xs"
                      data-testid={`input-funnel-value-${i}`}
                    />
                    <select
                      value={stage.color}
                      onChange={(e) => updateFunnelStage(i, 'color', e.target.value)}
                      className="text-xs border border-border rounded px-1 py-0.5 bg-background"
                      data-testid={`select-funnel-color-${i}`}
                    >
                      {colorOptions.map(([label, val]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <Button size="icon" variant="ghost" onClick={() => removeFunnelStage(i)} disabled={data.stages.length <= 2} data-testid={`delete-funnel-stage-${i}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'calendar': {
        const data = editedBlock.data as CalendarData;
        const updateCalendar = (fields: Partial<CalendarData>) => {
          setEditedBlock({ ...editedBlock, data: { ...data, ...fields } });
        };
        const now = new Date();
        const getMondayOfWeek = (dateStr: string) => {
          const d = new Date(dateStr || now.toISOString().split('T')[0]);
          const day = d.getDay();
          const diff = (day + 6) % 7;
          d.setDate(d.getDate() - diff);
          return d.toISOString().split('T')[0];
        };
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>View Mode</Label>
              <div className="flex gap-2">
                {(['week', 'month', 'year'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateCalendar({ view: v })}
                    className={`flex-1 py-1.5 rounded-md border text-sm font-medium transition-colors ${data.view === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                    data-testid={`button-calendar-view-${v}`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cal-title">Title</Label>
              <Input
                id="cal-title"
                value={data.title || ''}
                onChange={e => updateCalendar({ title: e.target.value })}
                placeholder="Calendar title..."
                data-testid="input-calendar-title"
              />
            </div>

            {data.view === 'week' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cal-week">Week starting (Monday)</Label>
                  <Input
                    id="cal-week"
                    type="date"
                    value={data.weekStartDate || ''}
                    onChange={e => updateCalendar({ weekStartDate: getMondayOfWeek(e.target.value) })}
                    data-testid="input-calendar-week"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cal-start-hour">Start hour</Label>
                    <Input
                      id="cal-start-hour"
                      type="number"
                      min={0}
                      max={22}
                      value={data.startHour}
                      onChange={e => updateCalendar({ startHour: Math.min(parseInt(e.target.value) || 0, data.endHour - 1) })}
                      data-testid="input-calendar-start-hour"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cal-end-hour">End hour</Label>
                    <Input
                      id="cal-end-hour"
                      type="number"
                      min={1}
                      max={24}
                      value={data.endHour}
                      onChange={e => updateCalendar({ endHour: Math.max(parseInt(e.target.value) || 24, data.startHour + 1) })}
                      data-testid="input-calendar-end-hour"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="cal-weekends"
                    type="checkbox"
                    checked={data.showWeekends}
                    onChange={e => updateCalendar({ showWeekends: e.target.checked })}
                    className="w-4 h-4"
                    data-testid="checkbox-calendar-weekends"
                  />
                  <Label htmlFor="cal-weekends">Show weekends</Label>
                </div>
              </>
            )}

            {data.view === 'month' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cal-month">Month</Label>
                  <select
                    id="cal-month"
                    value={data.month}
                    onChange={e => updateCalendar({ month: parseInt(e.target.value) })}
                    className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                    data-testid="select-calendar-month"
                  >
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal-year-m">Year</Label>
                  <Input
                    id="cal-year-m"
                    type="number"
                    value={data.year}
                    onChange={e => updateCalendar({ year: parseInt(e.target.value) || new Date().getFullYear() })}
                    min={2020}
                    max={2050}
                    data-testid="input-calendar-year-month"
                  />
                </div>
              </div>
            )}

            {data.view === 'year' && (
              <div className="space-y-2">
                <Label htmlFor="cal-year">Year</Label>
                <Input
                  id="cal-year"
                  type="number"
                  value={data.year}
                  onChange={e => updateCalendar({ year: parseInt(e.target.value) || new Date().getFullYear() })}
                  min={2020}
                  max={2050}
                  data-testid="input-calendar-year"
                />
              </div>
            )}

            {/* Events management */}
            {(data.events || []).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Events ({(data.events || []).length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(data.events || []).map((ev: CalendarEventItem) => {
                    const def = CALENDAR_EVENT_TYPES.find(t => t.key === ev.type);
                    return (
                      <div key={ev.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <Input
                          value={ev.label}
                          onChange={e => updateCalendar({
                            events: (data.events || []).map((x: CalendarEventItem) => x.id === ev.id ? { ...x, label: e.target.value } : x)
                          })}
                          className="flex-1 h-7 text-xs"
                          placeholder="Event label"
                        />
                        <select
                          value={ev.type}
                          onChange={e => {
                            const newDef = CALENDAR_EVENT_TYPES.find(t => t.key === e.target.value);
                            updateCalendar({
                              events: (data.events || []).map((x: CalendarEventItem) => x.id === ev.id
                                ? { ...x, type: e.target.value, color: x.color === def?.defaultColor ? (newDef?.defaultColor || x.color) : x.color }
                                : x)
                            });
                          }}
                          className="border border-border rounded px-1 py-0.5 text-xs bg-background"
                          title="Event type"
                        >
                          {CALENDAR_EVENT_TYPES.map(t => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                          ))}
                        </select>
                        <input
                          type="color"
                          value={ev.color}
                          onChange={e => updateCalendar({
                            events: (data.events || []).map((x: CalendarEventItem) => x.id === ev.id ? { ...x, color: e.target.value } : x)
                          })}
                          className="w-7 h-7 rounded cursor-pointer border border-border p-0.5 bg-background"
                          title="Event colour"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => updateCalendar({ events: (data.events || []).filter((x: CalendarEventItem) => x.id !== ev.id) })}
                          title="Delete event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'calendar-event': {
        const data = editedBlock.data as CalendarEventData;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-label">Event Label</Label>
              <Input
                id="event-label"
                value={data.label}
                onChange={e => setEditedBlock({ ...editedBlock, data: { ...data, label: e.target.value } })}
                placeholder="Event name..."
                data-testid="input-event-label"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <select
                id="event-type"
                value={data.eventType}
                onChange={e => setEditedBlock({ ...editedBlock, data: { ...data, eventType: e.target.value } })}
                className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                data-testid="select-event-type"
              >
                {['busy', 'meeting', 'focus', 'travel', 'break', 'lunch', 'ooo', 'holiday', 'deadline', 'workshop'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('ooo', 'Out of Office')}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-block-title">Block Title</Label>
              <Input
                id="event-block-title"
                value={editedBlock.title}
                onChange={e => setEditedBlock({ ...editedBlock, title: e.target.value })}
                data-testid="input-event-block-title"
              />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="block-editor-dialog">
        <DialogHeader>
          <DialogTitle>
            Edit {editedBlock?.type === 'stat' ? 'Stat' : editedBlock?.type === 'text' ? 'Text' : editedBlock?.type === 'gantt' ? 'Gantt' : editedBlock?.type === 'table' ? 'Table' : editedBlock?.type === 'image' ? 'Image' : editedBlock?.type === 'timeline' ? 'Timeline' : editedBlock?.type === 'pipeline' ? 'Pipeline' : editedBlock?.type === 'funnel' ? 'Funnel' : editedBlock?.type === 'calendar' ? 'Calendar' : editedBlock?.type === 'calendar-event' ? 'Calendar Event' : 'Chart'} Block
          </DialogTitle>
          <DialogDescription>
            Modify the block data and settings below.
          </DialogDescription>
        </DialogHeader>
        
        {editedBlock && (
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data" data-testid="tab-data">Data</TabsTrigger>
              <TabsTrigger value="size" data-testid="tab-size">Size</TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="mt-4">
              {renderEditor()}
            </TabsContent>
            
            <TabsContent value="size" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={editedBlock.size.width}
                    onChange={(e) => {
                      setEditedBlock({
                        ...editedBlock,
                        size: { ...editedBlock.size, width: parseInt(e.target.value) || 200 },
                      });
                    }}
                    min={100}
                    max={960}
                    data-testid="input-width"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={editedBlock.size.height}
                    onChange={(e) => {
                      setEditedBlock({
                        ...editedBlock,
                        size: { ...editedBlock.size, height: parseInt(e.target.value) || 120 },
                      });
                    }}
                    min={60}
                    max={540}
                    data-testid="input-height"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
