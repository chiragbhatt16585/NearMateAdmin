import React from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

type PortalModalProps = {
	title: string;
	onClose: () => void;
	children: React.ReactNode;
	maxWidthClass?: string;
};

const PortalModal: React.FC<PortalModalProps> = ({ title, onClose, children, maxWidthClass = 'max-w-md' }) => {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	React.useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement | null;
		const container = containerRef.current;
		if (container) {
			container.setAttribute('tabindex', '-1');
			container.focus();
		}
		return () => {
			if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
				previouslyFocused.focus();
			}
		};
	}, []);

	const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key !== 'Tab') return;
		const root = containerRef.current;
		if (!root) return;
		const focusable = Array.from(root.querySelectorAll<HTMLElement>(
			'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
		)).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	return createPortal(
		<div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onKeyDown={onKeyDown}>
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="absolute inset-0 grid place-items-center p-4">
				<div
					ref={containerRef}
					className={`w-full ${maxWidthClass} bg-white rounded-xl shadow-xl outline-none`}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="px-4 py-3 border-b flex items-center justify-between">
						<div className="font-semibold text-sm">{title}</div>
						<button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close"><XMarkIcon className="h-5 w-5" /></button>
					</div>
					<div className="p-4">{children}</div>
				</div>
			</div>
		</div>,
		document.getElementById('modal-root') as HTMLElement
	);
};

export default PortalModal;


