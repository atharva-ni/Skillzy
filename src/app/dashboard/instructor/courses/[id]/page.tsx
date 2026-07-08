'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { 
  BookOpen, Folder, FileText, Video, Code, Plus, Trash2, ArrowUp, ArrowDown, 
  ChevronRight, Save, Eye, ArrowLeft, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function CourseEditor() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  // State Management
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected item in split pane
  // type can be 'course' | 'module' | 'lesson' | 'step'
  const [selectedNode, setSelectedNode] = useState<{ type: string; id: string }>({
    type: 'course',
    id: courseId
  });

  // Current active data for edit forms
  const [editCourse, setEditCourse] = useState<any>({});
  const [editModule, setEditModule] = useState<any>({});
  const [editLesson, setEditLesson] = useState<any>({});
  const [editStep, setEditStep] = useState<any>({});

  // Active sub-tab inside Coding Lab editor
  const [activeLabTab, setActiveLabTab] = useState<'instructions' | 'starter' | 'solution'>('instructions');

  // Load course full curriculum tree and categories
  const fetchData = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch('/api/categories')
      ]);

      if (!courseRes.ok) {
        throw new Error('Failed to load course details');
      }

      const courseData = await courseRes.json();
      setCourse(courseData);
      setModules(courseData.modules || []);
      
      // Seed course editor form
      setEditCourse({
        title: courseData.title || '',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || '',
        price: courseData.price ? Number(courseData.price) : 0,
        level: courseData.level || 'beginner',
        categoryId: courseData.categoryId || '',
        status: courseData.status || 'draft',
        isFree: courseData.isFree || false
      });

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading course builder details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Load editor data when selectedNode changes
  useEffect(() => {
    if (!course) return;

    if (selectedNode.type === 'course') {
      setEditCourse({
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        price: course.price ? Number(course.price) : 0,
        level: course.level || 'beginner',
        categoryId: course.categoryId || '',
        status: course.status || 'draft',
        isFree: course.isFree || false
      });
    } else if (selectedNode.type === 'module') {
      const activeModule = modules.find(m => m.id === selectedNode.id);
      if (activeModule) {
        setEditModule({
          title: activeModule.title || '',
          description: activeModule.description || '',
          sortOrder: activeModule.sortOrder || 0,
          isFree: activeModule.isFree || false
        });
      }
    } else if (selectedNode.type === 'lesson') {
      // Find lesson inside modules
      let activeLesson: any = null;
      for (const m of modules) {
        const found = m.lessons?.find((l: any) => l.id === selectedNode.id);
        if (found) {
          activeLesson = found;
          break;
        }
      }
      if (activeLesson) {
        setEditLesson({
          title: activeLesson.title || '',
          description: activeLesson.description || '',
          durationMins: activeLesson.durationMins || 0,
          isFree: activeLesson.isFree || false,
          moduleId: activeLesson.moduleId || ''
        });
      }
    } else if (selectedNode.type === 'step') {
      // Find step inside lessons
      let activeStep: any = null;
      for (const m of modules) {
        for (const l of m.lessons || []) {
          const found = l.steps?.find((s: any) => s.id === selectedNode.id);
          if (found) {
            activeStep = found;
            break;
          }
        }
      }
      if (activeStep) {
        setEditStep({
          title: activeStep.title || '',
          stepType: activeStep.stepType || 'text',
          textContent: activeStep.textContent || '',
          videoUrl: activeStep.videoUrl || '',
          videoDurationSecs: activeStep.videoDurationSecs || 0,
          labLanguage: activeStep.labLanguage || 'javascript',
          labStarterCode: activeStep.labStarterCode || '',
          labSolutionCode: activeStep.labSolutionCode || '',
          labInstructions: activeStep.labInstructions || '',
          lessonId: activeStep.lessonId || ''
        });
      }
    }
  }, [selectedNode, modules, course]);

  // ----------------------------------------------------
  // Save Action Handlers
  // ----------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    let url = '';
    let method = 'PUT';
    let bodyData = {};

    if (selectedNode.type === 'course') {
      url = `/api/courses/${courseId}`;
      bodyData = editCourse;
    } else if (selectedNode.type === 'module') {
      url = `/api/modules/${selectedNode.id}`;
      bodyData = editModule;
    } else if (selectedNode.type === 'lesson') {
      url = `/api/lessons/${selectedNode.id}`;
      bodyData = editLesson;
    } else if (selectedNode.type === 'step') {
      url = `/api/steps/${selectedNode.id}`;
      bodyData = editStep;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      toast.success('Changes saved successfully');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // Add Curriculum Nodes (Module, Lesson, Step)
  // ----------------------------------------------------
  const handleAddModule = async () => {
    const title = window.prompt('Enter new Module Title:');
    if (!title) return;

    // Reset edit state immediately to clear previous input data
    setEditModule({
      title: title,
      description: '',
      sortOrder: modules.length + 1,
      isFree: false
    });

    try {
      const res = await fetch(`/api/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'module',
          data: {
            title,
            sortOrder: modules.length + 1
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create module');

      toast.success('Module added');
      setSelectedNode({ type: 'module', id: data.module.id });
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding module');
    }
  };

  const handleAddLesson = async (moduleId: string, currentLessonsCount: number) => {
    const title = window.prompt('Enter new Lesson Title:');
    if (!title) return;

    // Reset edit state immediately to clear previous input data
    setEditLesson({
      title: title,
      description: '',
      durationMins: 0,
      isFree: false,
      moduleId: moduleId
    });

    try {
      const res = await fetch(`/api/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lesson',
          data: {
            title,
            moduleId,
            sortOrder: currentLessonsCount + 1
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lesson');

      toast.success('Lesson added');
      setSelectedNode({ type: 'lesson', id: data.lesson.id });
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding lesson');
    }
  };

  const handleAddStep = async (lessonId: string, currentStepsCount: number, type: 'text' | 'video' | 'lab') => {
    const title = window.prompt(`Enter new ${type === 'lab' ? 'Coding Lab' : type === 'video' ? 'Video' : 'Text'} Step Title:`);
    if (!title) return;

    // Reset edit state immediately to clear previous input data
    setEditStep({
      title: title,
      stepType: type,
      textContent: type === 'text' ? 'Write your content here...' : '',
      videoUrl: '',
      videoDurationSecs: 0,
      labLanguage: type === 'lab' ? 'javascript' : 'javascript',
      labStarterCode: type === 'lab' ? '// Starter code here' : '',
      labSolutionCode: '',
      labInstructions: type === 'lab' ? 'Enter instructions here' : '',
      lessonId: lessonId
    });

    try {
      const res = await fetch(`/api/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'step',
          data: {
            title,
            lessonId,
            stepType: type,
            sortOrder: currentStepsCount + 1,
            textContent: type === 'text' ? 'Write your content here...' : '',
            labLanguage: type === 'lab' ? 'javascript' : undefined,
            labStarterCode: type === 'lab' ? '// Starter code here' : undefined,
            labInstructions: type === 'lab' ? 'Enter instructions here' : undefined
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create step');

      toast.success('Lesson step added');
      setSelectedNode({ type: 'step', id: data.step.id });
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding lesson step');
    }
  };

  // ----------------------------------------------------
  // Delete Curriculum Nodes (Module, Lesson, Step)
  // ----------------------------------------------------
  const handleDeleteNode = async (type: string, id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${type}? This action will remove all nested content.`)) {
      return;
    }

    let url = '';
    if (type === 'module') url = `/api/modules/${id}`;
    else if (type === 'lesson') url = `/api/lessons/${id}`;
    else if (type === 'step') url = `/api/steps/${id}`;

    try {
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to delete ${type}`);

      toast.success(`${type} deleted successfully`);
      setSelectedNode({ type: 'course', id: courseId });
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || `Error deleting ${type}`);
    }
  };

  // ----------------------------------------------------
  // Shift Ranks (Up / Down)
  // ----------------------------------------------------
  const handleShiftRank = async (type: 'module' | 'lesson' | 'step', item: any, direction: 'up' | 'down') => {
    let list: any[] = [];
    if (type === 'module') {
      list = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (type === 'lesson') {
      const parentModule = modules.find(m => m.id === item.moduleId);
      if (!parentModule) return;
      list = [...parentModule.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (type === 'step') {
      let parentLesson: any = null;
      for (const m of modules) {
        const found = m.lessons?.find((l: any) => l.id === item.lessonId);
        if (found) { parentLesson = found; break; }
      }
      if (!parentLesson) return;
      list = [...parentLesson.steps].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const currentIndex = list.findIndex(i => i.id === item.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === list.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetItem = list[swapIndex];

    try {
      setSaving(true);
      
      const update1 = fetch(
        type === 'module' ? `/api/modules/${item.id}` : type === 'lesson' ? `/api/lessons/${item.id}` : `/api/steps/${item.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: targetItem.sortOrder })
        }
      );

      const update2 = fetch(
        type === 'module' ? `/api/modules/${targetItem.id}` : type === 'lesson' ? `/api/lessons/${targetItem.id}` : `/api/steps/${targetItem.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: item.sortOrder })
        }
      );

      await Promise.all([update1, update2]);
      toast.success('Ranks updated successfully');
      await fetchData();
    } catch (err) {
      toast.error('Failed to swap positions');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get step type icon
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={13} className="text-info" />;
      case 'lab': return <Code size={13} className="text-warning" />;
      default: return <FileText size={13} className="text-primary" />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Loading Curriculum workspace...</span>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '20px 24px', maxWidth: '100%' }}>
      {/* Dynamic Breadcrumbs and Top Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard/instructor/courses" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div style={{ height: '24px', width: '1px', background: 'var(--border-primary)' }}></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} /> {course?.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <Badge variant={course?.status === 'published' ? 'success' : course?.status === 'pending' ? 'info' : 'warning'}>
                {course?.status}
              </Badge>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                ₹{((course?.price || 0) / 100).toLocaleString('en-IN')} paise base price
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Status Changer Toggle */}
          <select 
            value={editCourse.status || course?.status || 'draft'}
            className="input select"
            style={{ width: '140px', padding: '6px 12px', height: '36px', fontSize: 'var(--font-size-xs)' }}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                const res = await fetch(`/api/courses/${courseId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus })
                });
                if (res.ok) {
                  toast.success(`Course status updated to ${newStatus}`);
                  fetchData();
                } else {
                  toast.error('Failed to update status');
                }
              } catch (err) {
                toast.error('Error connecting to updates');
              }
            }}
          >
            <option value="draft">Draft Mode</option>
            <option value="pending">Submit Review</option>
            <option value="published">Publish Public</option>
          </select>

          <Button 
            variant="ghost" 
            style={{ height: '36px', gap: '6px', fontSize: 'var(--font-size-xs)' }}
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
          >
            <Eye size={14} /> Preview Student
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={saving} 
            style={{ height: '36px', gap: '6px', fontSize: 'var(--font-size-xs)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
          </Button>

          <button 
            className="btn btn-outline-danger" 
            style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '0 16px', borderRadius: '8px' }}
            onClick={async () => {
              if (window.confirm("Are you sure you want to permanently delete this course? This will remove all modules, lessons, steps, and progress records.")) {
                try {
                  setSaving(true);
                  const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success('Course deleted successfully');
                    router.push('/dashboard/instructor/courses');
                  } else {
                    toast.error(data.error || 'Failed to delete course');
                  }
                } catch (err) {
                  toast.error('Error connecting to deletion endpoint');
                } finally {
                  setSaving(false);
                }
              }
            }}
          >
            <Trash2 size={14} /> Delete Course
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(80vh - 100px)', alignItems: 'flex-start' }}>
        
        {/* LEFT PANE: Curriculum Outline (Tree builder) */}
        <div style={{
          width: '320px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '75vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={14} /> Curriculum Outline
            </h2>
            <button 
              onClick={handleAddModule}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary-hover)', fontWeight: 600 }}
            >
              <Plus size={12} /> Module
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Course Node (Root) */}
            <div 
              onClick={() => setSelectedNode({ type: 'course', id: courseId })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedNode.type === 'course' ? 'var(--border-secondary)' : 'transparent',
                background: selectedNode.type === 'course' ? 'var(--bg-primary)' : 'transparent',
                fontWeight: selectedNode.type === 'course' ? 600 : 500
              }}
            >
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                📖 General Details & Settings
              </span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>

            {/* Modules Loop */}
            {modules.sort((a, b) => a.sortOrder - b.sortOrder).map((mod: any, mIdx: number) => {
              const isModSelected = selectedNode.type === 'module' && selectedNode.id === mod.id;
              return (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Module Header Card */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isModSelected ? 'var(--border-secondary)' : 'var(--border-primary)',
                      background: isModSelected ? 'var(--bg-primary)' : 'var(--card-bg)'
                    }}
                  >
                    <div 
                      onClick={() => setSelectedNode({ type: 'module', id: mod.id })}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
                    >
                      <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {mod.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => handleShiftRank('module', mod, 'up')} disabled={mIdx === 0}>
                        <ArrowUp size={11} />
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '2px' }} onClick={() => handleShiftRank('module', mod, 'down')} disabled={mIdx === modules.length - 1}>
                        <ArrowDown size={11} />
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '2px', color: 'var(--error)' }} 
                        onClick={() => handleDeleteNode('module', mod.id)}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Lessons inside Module */}
                  <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(mod.lessons || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((les: any, lIdx: number) => {
                      const isLesSelected = selectedNode.type === 'lesson' && selectedNode.id === les.id;
                      return (
                        <div key={les.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: isLesSelected ? 'var(--border-secondary)' : 'transparent',
                              background: isLesSelected ? 'var(--bg-primary)' : 'transparent'
                            }}
                          >
                            <span 
                              onClick={() => setSelectedNode({ type: 'lesson', id: les.id })}
                              style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: isLesSelected ? 600 : 500, flex: 1 }}
                            >
                              📖 {les.title}
                            </span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                              <button className="btn btn-ghost" style={{ padding: '1px' }} onClick={() => handleShiftRank('lesson', les, 'up')} disabled={lIdx === 0}>
                                <ArrowUp size={10} />
                              </button>
                              <button className="btn btn-ghost" style={{ padding: '1px' }} onClick={() => handleShiftRank('lesson', les, 'down')} disabled={lIdx === (mod.lessons || []).length - 1}>
                                <ArrowDown size={10} />
                              </button>
                              <button 
                                className="btn btn-ghost" 
                                style={{ padding: '1px', color: 'var(--error)' }} 
                                onClick={() => handleDeleteNode('lesson', les.id)}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Steps inside Lesson */}
                          <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {(les.steps || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((stp: any, sIdx: number) => {
                              const isStpSelected = selectedNode.type === 'step' && selectedNode.id === stp.id;
                              return (
                                <div 
                                  key={stp.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: isStpSelected ? 'var(--border-primary)' : 'transparent'
                                  }}
                                >
                                  <span 
                                    onClick={() => setSelectedNode({ type: 'step', id: stp.id })}
                                    style={{ 
                                      fontSize: '11px', 
                                      color: 'var(--text-tertiary)', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '4px',
                                      flex: 1
                                    }}
                                  >
                                    {getStepIcon(stp.stepType)} {stp.title}
                                  </span>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                                    <button className="btn btn-ghost" style={{ padding: '1px' }} onClick={() => handleShiftRank('step', stp, 'up')} disabled={sIdx === 0}>
                                      <ArrowUp size={8} />
                                    </button>
                                    <button className="btn btn-ghost" style={{ padding: '1px' }} onClick={() => handleShiftRank('step', stp, 'down')} disabled={sIdx === (les.steps || []).length - 1}>
                                      <ArrowDown size={8} />
                                    </button>
                                    <button 
                                      className="btn btn-ghost" 
                                      style={{ padding: '1px', color: 'var(--error)' }} 
                                      onClick={() => handleDeleteNode('step', stp.id)}
                                    >
                                      <Trash2 size={8} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Add Step trigger inside lesson */}
                            <div style={{ display: 'flex', gap: '6px', paddingLeft: '4px', marginTop: '4px' }}>
                              <button 
                                onClick={() => handleAddStep(les.id, (les.steps || []).length, 'text')}
                                className="btn btn-ghost" 
                                style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--text-secondary)' }}
                              >
                                + Text
                              </button>
                              <button 
                                onClick={() => handleAddStep(les.id, (les.steps || []).length, 'video')}
                                className="btn btn-ghost" 
                                style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--text-secondary)' }}
                              >
                                + Video
                              </button>
                              <button 
                                onClick={() => handleAddStep(les.id, (les.steps || []).length, 'lab')}
                                className="btn btn-ghost" 
                                style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--accent-primary-hover)' }}
                              >
                                + Lab
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button 
                      onClick={() => handleAddLesson(mod.id, (mod.lessons || []).length)}
                      className="btn btn-ghost" 
                      style={{ fontSize: '10px', alignSelf: 'flex-start', color: 'var(--text-secondary)', padding: '2px 8px', marginTop: '4px' }}
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Selected Node Editor */}
        <div style={{
          flex: 1,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '24px',
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* 📋 COURSE DETAILS FORM EDITOR */}
          {selectedNode.type === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>General Course Setup</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Provide primary search catalog metadata details.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Course Title</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={editCourse.title || ''} 
                    onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Category</label>
                  <select 
                    className="input select"
                    value={editCourse.categoryId || ''} 
                    onChange={(e) => setEditCourse({ ...editCourse, categoryId: e.target.value })}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Short Description</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Introduce what students will accomplish in 1-2 sentences."
                  value={editCourse.shortDescription || ''} 
                  onChange={(e) => setEditCourse({ ...editCourse, shortDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Full Description (Markdown supported)</label>
                <textarea 
                  className="input" 
                  rows={6}
                  style={{ height: 'auto', resize: 'vertical' }}
                  value={editCourse.description || ''} 
                  onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Course Price (in paise: ₹1 = 100)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={editCourse.price ?? 0} 
                    onChange={(e) => setEditCourse({ ...editCourse, price: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Target Skill Level</label>
                  <select 
                    className="input select"
                    value={editCourse.level || 'beginner'} 
                    onChange={(e) => setEditCourse({ ...editCourse, level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      id="isFree"
                      checked={editCourse.isFree || false}
                      onChange={(e) => setEditCourse({ ...editCourse, isFree: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="isFree" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Mark as Free Course
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📂 MODULE DETAILS FORM EDITOR */}
          {selectedNode.type === 'module' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Module Details</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>A module groups multiple cohesive lessons and assignments together.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Module Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editModule.title || ''} 
                  onChange={(e) => setEditModule({ ...editModule, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Module Description</label>
                <textarea 
                  className="input" 
                  rows={4}
                  style={{ height: 'auto', resize: 'vertical' }}
                  value={editModule.description || ''} 
                  onChange={(e) => setEditModule({ ...editModule, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    id="modFree"
                    checked={editModule.isFree || false}
                    onChange={(e) => setEditModule({ ...editModule, isFree: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="modFree" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Mark entire module as Free Preview
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 📖 LESSON DETAILS FORM EDITOR */}
          {selectedNode.type === 'lesson' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Lesson Details</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Lessons hold the specific content steps that students unlock as they progress.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Lesson Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editLesson.title || ''} 
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Lesson Description</label>
                <textarea 
                  className="input" 
                  rows={4}
                  style={{ height: 'auto', resize: 'vertical' }}
                  value={editLesson.description || ''} 
                  onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Estimated Duration (in minutes)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={editLesson.durationMins ?? 0} 
                    onChange={(e) => setEditLesson({ ...editLesson, durationMins: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      id="lesFree"
                      checked={editLesson.isFree || false}
                      onChange={(e) => setEditLesson({ ...editLesson, isFree: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="lesFree" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Mark lesson as Free Preview
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📝 STEP DETAILS FORM EDITOR (Standard & Coding Lab) */}
          {selectedNode.type === 'step' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Lesson Step Content</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>A step represents a block of learning content: Text, Video, or an interactive Coding Lab.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Step Title</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={editStep.title || ''} 
                    onChange={(e) => setEditStep({ ...editStep, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Step Type</label>
                  <select 
                    className="input select"
                    value={editStep.stepType || 'text'}
                    onChange={(e) => setEditStep({ ...editStep, stepType: e.target.value })}
                  >
                    <option value="text">📖 Text/Markdown Documentation</option>
                    <option value="video">🎥 Video Lecture</option>
                    <option value="lab">💻 Interactive Coding Lab</option>
                  </select>
                </div>
              </div>

              {/* A. TEXT CONTENT TYPE */}
              {editStep.stepType === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label className="label">Step Text Content (Markdown supported)</label>
                  <textarea 
                    className="input" 
                    rows={12}
                    style={{ height: 'auto', flex: 1, resize: 'vertical', fontFamily: 'monospace' }}
                    value={editStep.textContent || ''} 
                    onChange={(e) => setEditStep({ ...editStep, textContent: e.target.value })}
                  />
                </div>
              )}

              {/* B. VIDEO CONTENT TYPE */}
              {editStep.stepType === 'video' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="label">Video URL (Vimeo, YouTube, AWS CloudFront, etc.)</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="https://example.com/lecture.mp4"
                      value={editStep.videoUrl || ''} 
                      onChange={(e) => setEditStep({ ...editStep, videoUrl: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="label">Video Duration (seconds)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={editStep.videoDurationSecs ?? 0} 
                      onChange={(e) => setEditStep({ ...editStep, videoDurationSecs: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {/* C. INTERACTIVE CODING LAB TYPE */}
              {editStep.stepType === 'lab' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    
                    {/* Language Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Coding Language:</span>
                      <select 
                        className="input select"
                        style={{ width: '130px', padding: '4px 8px', fontSize: 'var(--font-size-xs)', borderRadius: '6px' }}
                        value={editStep.labLanguage || 'javascript'}
                        onChange={(e) => setEditStep({ ...editStep, labLanguage: e.target.value })}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="c">C Language</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="sql">SQL Query</option>
                        <option value="html">HTML Structure</option>
                        <option value="css">CSS Styling</option>
                      </select>
                    </div>

                    {/* Sub-Tabs inside Coding Lab editor */}
                    <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveLabTab('instructions')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: activeLabTab === 'instructions' ? 'var(--bg-primary)' : 'transparent',
                          color: activeLabTab === 'instructions' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        1. Instructions
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveLabTab('starter')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: activeLabTab === 'starter' ? 'var(--bg-primary)' : 'transparent',
                          color: activeLabTab === 'starter' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        2. Starter Code
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveLabTab('solution')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: activeLabTab === 'solution' ? 'var(--bg-primary)' : 'transparent',
                          color: activeLabTab === 'solution' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        3. Validation Solution
                      </button>
                    </div>
                  </div>

                  {/* Sub-Tab Workspaces */}
                  <div style={{ flex: 1, minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
                    {/* Tab 1: Instructions Markdown */}
                    {activeLabTab === 'instructions' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <textarea 
                          className="input" 
                          rows={14}
                          placeholder="Describe the challenge instructions. Tell the student what function to write, what arguments to accept, and expected return output."
                          style={{ height: 'auto', flex: 1, resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                          value={editStep.labInstructions || ''} 
                          onChange={(e) => setEditStep({ ...editStep, labInstructions: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Tab 2: Monaco Starter Code */}
                    {activeLabTab === 'starter' && (
                      <div style={{ border: '1px solid var(--border-primary)', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                        <Editor
                          height="340px"
                          language={editStep.labLanguage || 'javascript'}
                          value={editStep.labStarterCode || ''}
                          theme="light"
                          onChange={(val) => setEditStep({ ...editStep, labStarterCode: val || '' })}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    )}

                    {/* Tab 3: Monaco Solution Check */}
                    {activeLabTab === 'solution' && (
                      <div style={{ border: '1px solid var(--border-primary)', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                        <Editor
                          height="340px"
                          language={editStep.labLanguage || 'javascript'}
                          value={editStep.labSolutionCode || ''}
                          theme="light"
                          onChange={(val) => setEditStep({ ...editStep, labSolutionCode: val || '' })}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Action Button for Non-Course Nodes */}
          {selectedNode.type !== 'course' && (
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline-danger"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600
                }}
                onClick={() => handleDeleteNode(selectedNode.type, selectedNode.id)}
              >
                <Trash2 size={14} /> Delete this {selectedNode.type}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
