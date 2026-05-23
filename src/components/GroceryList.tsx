import { useState, useMemo } from 'react';
import { Plus, Trash2, Check, ShoppingCart, Lightbulb, RefreshCw } from 'lucide-react';
import type { AppData } from '../types';
import type { GroceryItem, GroceryCategory } from '../types/grocery';
import { generateId } from '../utils/storage';
import { buildWeeklyInsight, analyzeGroceryItem, generateSmartSuggestions } from '../utils/recommendations';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const categoryLabels: Record<GroceryCategory, string> = {
  produce: 'Produce',
  protein: 'Protein',
  'dairy-eggs': 'Dairy & Eggs',
  grains: 'Grains',
  'fats-oils': 'Fats & Oils',
  legumes: 'Legumes & Beans',
  frozen: 'Frozen',
  beverages: 'Beverages',
  condiments: 'Condiments & Spices',
  snacks: 'Snacks',
  other: 'Other',
};

const statusConfig = {
  recommend: { color: '#22c55e', bg: '#22c55e18', label: 'Recommended', icon: '✓' },
  caution: { color: '#f59e0b', bg: '#f59e0b18', label: 'Use Caution', icon: '⚠' },
  avoid: { color: '#ef4444', bg: '#ef444418', label: 'Avoid / Swap', icon: '✗' },
};

type ViewTab = 'list' | 'insights';

function WeeklyInsightsPanel({ data }: { data: AppData }) {
  const insight = useMemo(() => buildWeeklyInsight(data), [data]);
  const suggestions = useMemo(() => generateSmartSuggestions(insight), [insight]);

  const carbColor =
    (insight.avgDailyCarbs ?? 0) > 150 ? '#ef4444' :
    (insight.avgDailyCarbs ?? 0) > 120 ? '#f59e0b' : '#22c55e';

  const aiColor =
    (insight.avgAntiInflamScore ?? 0) >= 1 ? '#22c55e' :
    (insight.avgAntiInflamScore ?? 0) >= 0 ? '#f59e0b' : '#ef4444';

  const glucoseColor =
    (insight.avgGlucose ?? 0) > 180 ? '#ef4444' :
    (insight.avgGlucose ?? 0) > 140 ? '#f97316' :
    (insight.avgGlucose ?? 0) > 0 ? '#22c55e' : '#94a3b8';

  return (
    <div>
      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>
        7-Day Food Pattern Analysis
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          {
            label: 'Avg Daily Carbs',
            value: insight.avgDailyCarbs !== null ? `${insight.avgDailyCarbs}g` : '–',
            sub: 'Target: <150g/day',
            color: carbColor,
          },
          {
            label: 'Diet AI Score',
            value: insight.avgAntiInflamScore !== null
              ? `${insight.avgAntiInflamScore > 0 ? '+' : ''}${insight.avgAntiInflamScore}`
              : '–',
            sub: 'Target: ≥+1',
            color: aiColor,
          },
          {
            label: 'Avg Glucose',
            value: insight.avgGlucose !== null ? `${insight.avgGlucose} mg/dL` : '–',
            sub: 'Target: 80–140',
            color: glucoseColor,
          },
          {
            label: 'Omega-3 Meals',
            value: `${insight.omega3Count}`,
            sub: 'Target: ≥3/week',
            color: insight.omega3Count >= 3 ? '#22c55e' : insight.omega3Count >= 1 ? '#f59e0b' : '#ef4444',
          },
          {
            label: 'Leafy Greens',
            value: `${insight.leafyGreenCount} servings`,
            sub: 'Target: ≥5/week',
            color: insight.leafyGreenCount >= 5 ? '#22c55e' : insight.leafyGreenCount >= 3 ? '#f59e0b' : '#ef4444',
          },
          {
            label: 'High-GI Foods',
            value: `${insight.highGIFoodCount} logged`,
            sub: 'Lower is better',
            color: insight.highGIFoodCount === 0 ? '#22c55e' : insight.highGIFoodCount <= 3 ? '#f59e0b' : '#ef4444',
          },
        ].map(m => (
          <div key={m.label} style={{
            background: '#1e293b', borderRadius: 10, padding: '10px 12px',
            border: '1px solid #334155',
          }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {insight.recentFlareUp && (
        <div style={{
          background: '#ef444415', border: '1px solid #ef444430', borderRadius: 10,
          padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#ef4444',
        }}>
          <span style={{ fontWeight: 700 }}>⚠ UCTD Flare-Up Detected</span> — A flare was logged this week.
          Recommendations below are stricter on inflammatory foods.
        </div>
      )}

      {insight.highCarbDays > 0 && (
        <div style={{
          background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: 10,
          padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#f59e0b',
        }}>
          <span style={{ fontWeight: 700 }}>{insight.highCarbDays} high-carb day(s)</span> logged this week (&gt;150g).
          Prioritize low-GI and low-carb items on your grocery run.
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{
          background: '#1e293b', borderRadius: 10, padding: '12px 14px',
          border: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Lightbulb size={14} color="#f59e0b" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
              Smart Add-to-List Suggestions
            </span>
          </div>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '5px 0',
              borderBottom: i < suggestions.length - 1 ? '1px solid #0f172a' : 'none',
            }}>
              <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>→</span>
              <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {data.foodEntries.length === 0 && (
        <div style={{ textAlign: 'center', color: '#475569', fontSize: 12, padding: '20px 0' }}>
          Log food entries to see personalized weekly analysis here.
        </div>
      )}
    </div>
  );
}

function GroceryItemCard({
  item,
  onToggle,
  onDelete,
}: {
  item: GroceryItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const analysis = item.analysis;
  const sc = analysis ? statusConfig[analysis.status] : null;

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 12,
      marginBottom: 8,
      border: `1px solid ${sc ? sc.color + '44' : '#334155'}`,
      opacity: item.checked ? 0.55 : 1,
      transition: 'opacity 0.15s',
    }}>
      <div style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Checkbox */}
        <button
          onClick={onToggle}
          style={{
            width: 24, height: 24, borderRadius: 6, border: `2px solid ${sc?.color ?? '#334155'}`,
            background: item.checked ? (sc?.color ?? '#334155') : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {item.checked && <Check size={13} color="#fff" strokeWidth={3} />}
        </button>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpanded(e => !e)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 14, fontWeight: 600, color: '#e2e8f0',
              textDecoration: item.checked ? 'line-through' : 'none',
            }}>
              {item.name}
            </span>
            {item.quantity && (
              <span style={{ fontSize: 11, color: '#64748b' }}>{item.quantity}</span>
            )}
            {sc && (
              <span style={{
                fontSize: 10, padding: '1px 7px', borderRadius: 99,
                background: sc.bg, color: sc.color, fontWeight: 700,
              }}>
                {sc.icon} {sc.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
            {categoryLabels[item.category]}
            {analysis?.glycemicIndex ? ` · GI ${analysis.glycemicIndex}` : ''}
            {analysis?.antiInflammatoryScore !== null && analysis?.antiInflammatoryScore !== undefined
              ? ` · AI ${analysis.antiInflammatoryScore > 0 ? '+' : ''}${analysis.antiInflammatoryScore}`
              : ''}
          </div>
        </div>

        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4, flexShrink: 0 }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded analysis */}
      {expanded && analysis && (
        <div style={{
          padding: '0 13px 13px',
          borderTop: '1px solid #0f172a',
        }}>
          {analysis.weeklyContext && (
            <div style={{
              fontSize: 10, color: '#64748b', background: '#0f172a',
              borderRadius: 6, padding: '5px 8px', margin: '10px 0 8px',
              fontFamily: 'monospace',
            }}>
              This week → {analysis.weeklyContext}
            </div>
          )}

          {/* Reasons */}
          {analysis.reasons.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {analysis.reasons.map((r, i) => {
                const isWarning = r.toLowerCase().startsWith('high') ||
                  r.toLowerCase().startsWith('medium') ||
                  r.toLowerCase().startsWith('very') ||
                  r.toLowerCase().startsWith('diabetes') ||
                  r.toLowerCase().startsWith('uctd') ||
                  r.toLowerCase().startsWith('significantly') ||
                  r.toLowerCase().startsWith('strongly') ||
                  r.toLowerCase().startsWith('mildly inflam');
                return (
                  <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', alignItems: 'flex-start' }}>
                    <span style={{ color: isWarning ? '#f97316' : '#22c55e', fontSize: 12, flexShrink: 0, marginTop: 1 }}>
                      {isWarning ? '⚠' : '✓'}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{r}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Condition badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: analysis.alternatives.length > 0 ? 10 : 0 }}>
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 99,
              background: analysis.diabetesFriendly ? '#22c55e18' : '#ef444418',
              color: analysis.diabetesFriendly ? '#22c55e' : '#ef4444',
              fontWeight: 600,
            }}>
              Diabetes: {analysis.diabetesFriendly ? 'OK' : 'Caution'}
            </span>
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 99,
              background: analysis.uctdFriendly ? '#22c55e18' : '#ef444418',
              color: analysis.uctdFriendly ? '#22c55e' : '#ef4444',
              fontWeight: 600,
            }}>
              UCTD: {analysis.uctdFriendly ? 'OK' : 'Caution'}
            </span>
          </div>

          {/* Alternatives */}
          {analysis.alternatives.length > 0 && (
            <div style={{
              background: '#0f172a', borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>
                Healthier Alternatives
              </div>
              {analysis.alternatives.map((alt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: i < analysis.alternatives.length - 1 ? '1px solid #1e293b' : 'none' }}>
                  <span style={{ color: '#38bdf8', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{alt.name}</span>
                  <span style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{alt.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GroceryList({ data, onChange }: Props) {
  const [viewTab, setViewTab] = useState<ViewTab>('list');
  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemCategory, setItemCategory] = useState<GroceryCategory>('produce');
  const [filter, setFilter] = useState<'all' | 'recommend' | 'caution' | 'avoid'>('all');

  const insight = useMemo(() => buildWeeklyInsight(data), [data]);

  function addItem() {
    if (!itemName.trim()) return;
    const analysis = analyzeGroceryItem(itemName.trim(), insight);
    const item: GroceryItem = {
      id: generateId(),
      name: itemName.trim(),
      quantity: itemQty.trim(),
      category: itemCategory,
      checked: false,
      addedAt: new Date().toISOString(),
      analysis,
    };
    onChange({ ...data, groceryItems: [item, ...data.groceryItems] });
    setItemName('');
    setItemQty('');
    setShowForm(false);
  }

  function reAnalyzeAll() {
    const updatedItems = data.groceryItems.map(item => ({
      ...item,
      analysis: analyzeGroceryItem(item.name, insight),
    }));
    onChange({ ...data, groceryItems: updatedItems });
  }

  function toggleItem(id: string) {
    const updatedItems = data.groceryItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onChange({ ...data, groceryItems: updatedItems });
  }

  function deleteItem(id: string) {
    onChange({ ...data, groceryItems: data.groceryItems.filter(i => i.id !== id) });
  }

  function clearChecked() {
    onChange({ ...data, groceryItems: data.groceryItems.filter(i => !i.checked) });
  }

  const filteredItems = data.groceryItems.filter(item => {
    if (filter === 'all') return true;
    return item.analysis?.status === filter;
  });

  const grouped = useMemo(() => {
    const order: GroceryCategory[] = ['produce', 'protein', 'dairy-eggs', 'grains', 'legumes', 'fats-oils', 'frozen', 'beverages', 'condiments', 'snacks', 'other'];
    const map: Partial<Record<GroceryCategory, GroceryItem[]>> = {};
    for (const item of filteredItems) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category]!.push(item);
    }
    return order.filter(c => map[c] && map[c]!.length > 0).map(c => ({ category: c, items: map[c]! }));
  }, [filteredItems]);

  const counts = useMemo(() => ({
    total: data.groceryItems.length,
    checked: data.groceryItems.filter(i => i.checked).length,
    recommend: data.groceryItems.filter(i => i.analysis?.status === 'recommend').length,
    caution: data.groceryItems.filter(i => i.analysis?.status === 'caution').length,
    avoid: data.groceryItems.filter(i => i.analysis?.status === 'avoid').length,
  }), [data.groceryItems]);

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={20} color="#38bdf8" />
            Grocery List
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>
            AI-validated for diabetes & UCTD
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {data.groceryItems.length > 0 && (
            <button
              onClick={reAnalyzeAll}
              title="Re-analyze all items against latest weekly data"
              style={{
                background: '#334155', border: 'none', borderRadius: 8,
                padding: '7px 10px', cursor: 'pointer', color: '#94a3b8',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
              }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#0ea5e9', color: '#fff', border: 'none',
              borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#0f172a', borderRadius: 10, padding: 3, marginBottom: 14 }}>
        {(['list', 'insights'] as ViewTab[]).map(t => (
          <button
            key={t}
            onClick={() => setViewTab(t)}
            style={{
              flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: viewTab === t ? '#334155' : 'transparent',
              color: viewTab === t ? '#f1f5f9' : '#64748b',
              fontSize: 13, fontWeight: viewTab === t ? 600 : 400,
            }}
          >
            {t === 'list' ? `List (${counts.total})` : 'Weekly Insights'}
          </button>
        ))}
      </div>

      {viewTab === 'insights' && (
        <WeeklyInsightsPanel data={data} />
      )}

      {viewTab === 'list' && (
        <>
          {/* Add item form */}
          {showForm && (
            <div style={{
              background: '#1e293b', borderRadius: 12, padding: 14,
              marginBottom: 14, border: '1px solid #334155',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>Item name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    placeholder="e.g. Salmon, White rice, Blueberries"
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Qty</label>
                  <input
                    type="text"
                    value={itemQty}
                    onChange={e => setItemQty(e.target.value)}
                    placeholder="1 lb"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Category</label>
                <select value={itemCategory} onChange={e => setItemCategory(e.target.value as GroceryCategory)} style={inputStyle}>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addItem} style={{ flex: 1, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Analyze & Add
                </button>
                <button onClick={() => setShowForm(false)} style={{ background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status filter + summary */}
          {data.groceryItems.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {([
                  { key: 'all', label: `All (${counts.total})`, color: '#94a3b8' },
                  { key: 'recommend', label: `✓ ${counts.recommend}`, color: '#22c55e' },
                  { key: 'caution', label: `⚠ ${counts.caution}`, color: '#f59e0b' },
                  { key: 'avoid', label: `✗ ${counts.avoid}`, color: '#ef4444' },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding: '4px 10px', borderRadius: 99, border: `1px solid ${f.color}44`,
                      background: filter === f.key ? `${f.color}22` : 'transparent',
                      color: filter === f.key ? f.color : '#64748b',
                      fontSize: 12, cursor: 'pointer', fontWeight: filter === f.key ? 700 : 400,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                {counts.checked > 0 && (
                  <button
                    onClick={clearChecked}
                    style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 99, border: '1px solid #334155', background: 'transparent', color: '#64748b', fontSize: 11, cursor: 'pointer' }}
                  >
                    Clear checked ({counts.checked})
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                  <span>{counts.checked} of {counts.total} items checked off</span>
                  <span>{Math.round((counts.checked / counts.total) * 100)}%</span>
                </div>
                <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${(counts.checked / counts.total) * 100}%`,
                    background: 'linear-gradient(90deg, #22c55e, #0ea5e9)',
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            </>
          )}

          {/* Grouped list */}
          {data.groceryItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '40px 20px' }}>
              <ShoppingCart size={36} color="#334155" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 6 }}>Your grocery list is empty</div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                Add items above — each one will be cross-checked against your weekly food history and flagged for diabetes and UCTD compatibility.
              </div>
            </div>
          ) : grouped.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
              No items match this filter.
            </div>
          ) : (
            grouped.map(({ category, items }) => (
              <div key={category} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, color: '#64748b', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  marginBottom: 8, paddingLeft: 2,
                }}>
                  {categoryLabels[category]}
                </div>
                {items.map(item => (
                  <GroceryItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' };
