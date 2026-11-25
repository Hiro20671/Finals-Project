import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Heart, Sparkles, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 text-white mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-black tracking-tight">
                Acad<span className="text-brand-400">ex</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              A peer-to-peer academic exchange platform connecting university students to buy, lend, donate, and exchange textbooks, reviewers, and study notes affordably.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <GraduationCap size={15} className="text-brand-400" />
              <span>Built by Students, for Students</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Browse All Materials</Link></li>
              <li><Link to="/marketplace?listing_type=SALE" className="hover:text-white transition-colors">Buy Second-Hand Books</Link></li>
              <li><Link to="/marketplace?listing_type=LEND" className="hover:text-white transition-colors">Borrow Reviewers</Link></li>
              <li><Link to="/marketplace?listing_type=DONATION" className="hover:text-white transition-colors">Free Donated Materials</Link></li>
              <li><Link to="/marketplace?listing_type=EXCHANGE" className="hover:text-white transition-colors">Book-for-Book Exchange</Link></li>
            </ul>
          </div>

          {/* Academic Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/marketplace?category=textbooks" className="hover:text-white transition-colors">Curriculum Textbooks</Link></li>
              <li><Link to="/marketplace?category=reviewers-board-prep" className="hover:text-white transition-colors">Board Exam Reviewers</Link></li>
              <li><Link to="/marketplace?category=lecture-notes-summaries" className="hover:text-white transition-colors">Lecture Notes & Kits</Link></li>
              <li><Link to="/marketplace?category=study-guides-solutions" className="hover:text-white transition-colors">Study Guides & Solutions</Link></li>
              <li><Link to="/marketplace?category=reference-materials" className="hover:text-white transition-colors">Handbooks & References</Link></li>
            </ul>
          </div>

          {/* Safety & Integrity */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Academic Trust & Safety</h4>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Meet on campus library or student centers for safe item handover.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Respect lending due dates and handle materials with care.</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <span>Pass it forward: donate unused notes to incoming freshmen.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Acadex P2P Academic Book & Reviewer Exchange. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span className="hover:text-slate-300">Terms of Exchange</span>
            <span className="hover:text-slate-300">Campus Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

