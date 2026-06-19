import React, { useState, useEffect, useRef } from 'react';
import { useGuest, GuestProvider } from './context/GuestContext';
import { useSensorSim } from './hooks/useSensorSim';
import { CheckInForm } from './components/Forms/CheckInForm';
import { MiniBarGrid } from './components/MiniBar/MiniBarGrid';
import { SensorLog } from './components/MiniBar/SensorLog';
import { ConsumptionForm } from './components/Forms/ConsumptionForm';
import { ReplenishmentSchedule } from './components/Schedule/ReplenishmentSchedule';
import { InventoryCharts } from './components/Dashboard/InventoryCharts';
import { HistoryTracking } from './components/History/HistoryTracking';
import { BarMenu } from './components/HotelBar/BarMenu';
import { DrinkMixer } from './components/HotelBar/DrinkMixer';
import { StaffAlerts } from './components/Staff/StaffAlerts';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { Modal } from './components/Common/Modal';
import { ToastManager } from './components/Common/ToastManager';
import { 
  Compass, 
  CreditCard, 
  User, 
  Sparkles, 
  HelpCircle, 
  Settings, 
  Beer, 
  FileText,
  DollarSign,
  Activity,
  Calendar,
  History,
  ClipboardList
} from 'lucide-react';
import appStyles from './styles/App.module.css';
import dashStyles from './styles/Dashboard.module.css';
import compStyles from './styles/Components.module.css';

export const AppContent: React.FC = () => {
  const { 
    session, 
    subtotal, 
    discount, 
    tax, 
    total, 
    checkoutFolio, 
    resetFolio, 
    isCheckingOut, 
    checkoutCompleted,
    addToast
  } = useGuest();

  // State telemetry simulator (CO4)
  const { items, logs, countdown, liftItem, replaceItem, restockItem } = useSensorSim();

  // SPA hash-routing states (CO5)
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Monitor logs and push toast notifications dynamically when weight plates trigger (CO4)
  const lastLogId = useRef('');
  useEffect(() => {
    if (logs.length > 0 && logs[0].id !== lastLogId.current) {
      lastLogId.current = logs[0].id;
      const latestLog = logs[0];
      if (latestLog.eventType === 'picked-up') {
        addToast(`Telemetry: ${latestLog.itemName} lifted. 15s to charge.`, 'warning');
      } else if (latestLog.eventType === 'replaced') {
        addToast(`Telemetry: ${latestLog.itemName} returned to shelf.`, 'success');
      }
    }
  }, [logs, addToast]);

  // Routing synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      if (['dashboard', 'logs', 'schedule', 'history', 'lounge', 'staff'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCheckoutSubmit = async () => {
    const success = await checkoutFolio();
    if (success) {
      // Keep modal open to display settlement check
    }
  };

  // CHECK-IN GATE ROUTE LOCK (CO5)
  if (!session) {
    return (
      <div className={appStyles.container}>
        <header className={appStyles.header}>
          <div className={appStyles.logoArea}>
            <div className={appStyles.logoIcon}>🍸</div>
            <div className={appStyles.titleGroup}>
              <h1>Smart Sense</h1>
              <p>Hotel Bar & Mini-Bar Operations</p>
            </div>
          </div>
        </header>
        <main className={appStyles.mainContent}>
          <CheckInForm />
        </main>
        <ToastManager />
      </div>
    );
  }

  return (
    <div className={appStyles.container}>
      {/* Header Bar */}
      <header className={appStyles.header}>
        <div className={appStyles.logoArea}>
          <div className={appStyles.logoIcon}>🍸</div>
          <div className={appStyles.titleGroup}>
            <h1>Smart Sense</h1>
            <p>Hotel Bar & Mini-Bar Operations</p>
          </div>
        </div>

        {/* 7 Tab SPA Routing Navigation Menu (CO5) */}
        <nav className={appStyles.nav} aria-label="Main Navigation">
          <button 
            className={`${appStyles.navLink} ${currentRoute === 'dashboard' ? appStyles.navLinkActive : ''}`}
            onClick={() => window.location.hash = 'dashboard'}
          >
            <Compass size={14} /> Home Dashboard
          </button>
          
          <button 
            className={`${appStyles.navLink} ${currentRoute === 'logs' ? appStyles.navLinkActive : ''}`}
            onClick={() => window.location.hash = 'logs'}
          >
            <Activity size={14} /> Minibar Log
          </button>

          <button 
            className={`${appStyles.navLink} ${currentRoute === 'schedule' ? appStyles.navLinkActive : ''}`}
            onClick={() => window.location.hash = 'schedule'}
          >
            <Calendar size={14} /> Replenishment Schedule
          </button>

          <button 
            className={`${appStyles.navLink} ${currentRoute === 'history' ? appStyles.navLinkActive : ''}`}
            onClick={() => window.location.hash = 'history'}
          >
            <History size={14} /> History Tracking
          </button>

          <button 
            className={`${appStyles.navLink} ${currentRoute === 'lounge' ? appStyles.navLinkActive : ''}`}
            onClick={() => window.location.hash = 'lounge'}
          >
            <Beer size={14} /> Lounge Cocktails
          </button>

          <button 
            className={`${appStyles.navLink} ${currentRoute === 'staff' ? appStyles.navLinkActive : ''}`}
            onClick={() => window.location.hash = 'staff'}
            style={{ borderLeft: '1px dashed var(--border-glow)' }}
          >
            <Settings size={14} /> Staff Panel
          </button>
        </nav>

        {/* User profile Badge */}
        <div className={appStyles.guestBadge}>
          <div className={appStyles.badgeDot} />
          <span>Room {session.roomNumber}</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{session.guestName}</span>
        </div>
      </header>

      {/* Main View Port Container */}
      <main id="main-content" className={`${appStyles.mainContent} animate-slide-in`}>
        
        {/* TAB 1: HOME DASHBOARD */}
        {currentRoute === 'dashboard' && (
          <div className={dashStyles.dashboardGrid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Metrics cards row */}
              <section className={dashStyles.statsRow}>
                <div className={dashStyles.statCard}>
                  <User size={20} className={dashStyles.statIcon} />
                  <div className={dashStyles.statInfo}>
                    <h4>Loyalty Benefit</h4>
                    <div className={dashStyles.statValue} style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={14} /> {session.loyaltyTier}
                    </div>
                  </div>
                </div>
                
                <div className={dashStyles.statCard}>
                  <CreditCard size={20} className={dashStyles.statIcon} />
                  <div className={dashStyles.statInfo}>
                    <h4>Total Bill</h4>
                    <div className={dashStyles.statValue}>${total.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className={dashStyles.statCard}>
                  <HelpCircle size={20} className={dashStyles.statIcon} />
                  <div className={dashStyles.statInfo}>
                    <h4>Sensor Ticks</h4>
                    <div className={dashStyles.statValue} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {Object.keys(countdown).length > 0 ? (
                        <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                          {Object.keys(countdown).length} item(s) off rack
                        </span>
                      ) : (
                        "Shelves normal"
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Shelf display grid */}
              <section>
                <MiniBarGrid 
                  items={items}
                  countdown={countdown}
                  onLift={liftItem}
                  onReplace={replaceItem}
                />
              </section>
            </div>

            {/* Right sidebar details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Folio Billing Summary Card */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif' }}>
                  <FileText size={16} style={{ color: 'var(--accent-gold)' }} />
                  Current Room Folio
                </h2>
                
                <div className={dashStyles.folioList}>
                  {session.folioCharges.length === 0 ? (
                    <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No bar or minibar charges recorded.
                    </div>
                  ) : (
                    session.folioCharges.map(charge => (
                      <div key={charge.id} className={dashStyles.folioItem}>
                        <div>
                          <div className={dashStyles.folioItemDesc}>{charge.desc}</div>
                          <div className={dashStyles.folioItemMeta}>
                            {charge.category} • {new Date(charge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className={dashStyles.folioItemAmt}>
                          ${charge.amount.toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <div className={dashStyles.summaryRow}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className={dashStyles.summaryRow}>
                    <span>Loyalty discount ({session.loyaltyTier === 'Platinum' ? '15%' : session.loyaltyTier === 'Gold' ? '10%' : '5%'})</span>
                    <span style={{ color: 'var(--color-success)' }}>-${discount.toFixed(2)}</span>
                  </div>
                  <div className={dashStyles.summaryRow}>
                    <span>Hospitality Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className={dashStyles.summaryTotal}>
                    <span>Total Folio Due</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className={`${compStyles.btn} ${compStyles.btnPrimary}`}
                  style={{ width: '100%', marginTop: '16px', padding: '12px' }}
                  onClick={() => setIsCheckoutModalOpen(true)}
                  disabled={session.folioCharges.length === 0}
                >
                  Request Express Checkout
                </button>
              </div>

              {/* SVG Statistics Chart Card */}
              <InventoryCharts items={items} />
            </div>
          </div>
        )}

        {/* TAB 2: MINIBAR LOG & CONSUMPTION FORM */}
        {currentRoute === 'logs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            <SensorLog logs={logs} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ConsumptionForm />
              <div className="glass-panel" style={{ padding: '20px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <h3 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ClipboardList size={14} /> Manual Consumption Logs
                </h3>
                If a guest uses items that are not monitored by weight sensors (e.g. amenities, extra wine, or bottled craft beers), they should self-report them here. Attendants also use this portal to double-verify stock configurations.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REPLENISHMENT SCHEDULE */}
        {currentRoute === 'schedule' && (
          <ReplenishmentSchedule />
        )}

        {/* TAB 4: HISTORY TRACKING */}
        {currentRoute === 'history' && (
          <HistoryTracking />
        )}

        {/* TAB 5: LOUNGE COCKTAILS */}
        {currentRoute === 'lounge' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <ErrorBoundary>
              <BarMenu />
            </ErrorBoundary>
            <DrinkMixer />
          </div>
        )}

        {/* TAB 6: STAFF OPERATIONS */}
        {currentRoute === 'staff' && (
          <StaffAlerts 
            items={items}
            onRestock={restockItem}
          />
        )}

      </main>

      {/* Checkout Modal overlay dialogue */}
      <Modal 
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          if (!isCheckingOut) setIsCheckoutModalOpen(false);
        }}
        title="Room Suite Checkout Invoice"
      >
        {checkoutCompleted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 16px'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '18px', color: '#a7f3d0' }}>Invoice Paid & Settled</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
              Thank you, {session.guestName}. Your payment was routed to credit card ending in **4982. A receipt has been sent to your email.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className={`${compStyles.btn}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  resetFolio();
                  window.location.hash = 'history'; // route to history tab to view archived bill
                }}
              >
                Reset Folio (Demo)
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Please review your summary invoice for Suite {session.roomNumber} prior to executing electronic settlement:
            </p>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div className={dashStyles.summaryRow}>
                <span>Subtotal Charges:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={dashStyles.summaryRow}>
                <span>Loyalty Credit:</span>
                <span style={{ color: 'var(--color-success)' }}>-${discount.toFixed(2)}</span>
              </div>
              <div className={dashStyles.summaryRow}>
                <span>Taxes & Levies:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className={dashStyles.summaryTotal} style={{ fontSize: '15px', marginTop: '12px', paddingTop: '12px' }}>
                <span>Final Settlement Amount:</span>
                <span style={{ color: 'var(--accent-gold)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className={compStyles.modalActions}>
              <button 
                className={compStyles.btn} 
                onClick={() => setIsCheckoutModalOpen(false)}
                disabled={isCheckingOut}
              >
                Cancel
              </button>
              <button 
                className={`${compStyles.btn} ${compStyles.btnPrimary}`}
                onClick={handleCheckoutSubmit}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={14} className="animate-spin" /> Finalizing payment...
                  </span>
                ) : (
                  <span>Settle Bill & Checkout</span>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Global Notifications Toast Portal */}
      <ToastManager />

      {/* Global Footer */}
      <footer className={appStyles.footer}>
        <p>
          Smart Sense Integrated IoT Platform © 2026. Designed for Front-End Engineering & Framework Design (FEFD).
          <a href="#" className={appStyles.footerLink} onClick={(e) => { e.preventDefault(); alert("This is an academic framework simulation showcasing React concepts (state reconciliation, memoization, virtualization, lifecycle events, and typescript generic structures)."); }}>Platform Architecture Info</a>
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GuestProvider>
      <AppContent />
    </GuestProvider>
  );
}
