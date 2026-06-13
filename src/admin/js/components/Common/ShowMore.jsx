import { useState, useRef, useEffect } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { Button, Icon, InlineStack } from '@shopify/polaris';
import { ChevronDownIcon } from '@shopify/polaris-icons';

const ShowMore = ( { triggerText, items } ) => {
	const [ isOpen, setIsOpen ]   = useState( false );
	const [ dropdownPos, setDropdownPos ] = useState( { top: 0, left: 0 } );
	const triggerRef = useRef( null );

	const updatePosition = () => {
		if ( ! triggerRef.current ) return;
		const rect = triggerRef.current.getBoundingClientRect();
		setDropdownPos( {
			top:  rect.bottom + window.scrollY + 4,
			left: rect.left + window.scrollX,
		} );
	};

	const open = () => {
		updatePosition();
		setIsOpen( true );
	};

	const close = () => setIsOpen( false );

	const toggle = () => ( isOpen ? close() : open() );

	useEffect( () => {
		if ( ! isOpen ) return;
		const handleClickOutside = ( event ) => {
			if (
				triggerRef.current &&
				! triggerRef.current.contains( event.target ) &&
				! event.target.closest( '.lpl-show-more-dropdown' )
			) {
				close();
			}
		};
		const handleScroll = () => updatePosition();
		document.addEventListener( 'mousedown', handleClickOutside );
		window.addEventListener( 'scroll', handleScroll, true );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
			window.removeEventListener( 'scroll', handleScroll, true );
		};
	}, [ isOpen ] );

	return (
		<div ref={ triggerRef } style={ { display: 'inline-block' } }>
			<InlineStack gap="100" blockAlign="center">
				<span>{ triggerText }</span>
				<Button
					variant="plain"
					size="slim"
					icon={ <Icon source={ ChevronDownIcon } /> }
					onClick={ toggle }
					accessibilityLabel="Show available tokens"
				/>
			</InlineStack>
			{ isOpen && createPortal(
				<div
					className="lpl-show-more-dropdown"
					style={ {
						position: 'absolute',
						top:      dropdownPos.top,
						left:     dropdownPos.left,
						zIndex:   999999,
						background:   'var(--p-color-bg-surface)',
						border:       '1px solid var(--p-color-border)',
						borderRadius: 'var(--p-border-radius-300)',
						padding:      '12px 16px',
						boxShadow:    'var(--p-shadow-300)',
						minWidth:     '320px',
						maxWidth:     '420px',
					} }
				>
					{ Object.entries( items ).map( ( [ token, desc ] ) => (
						<div key={ token } style={ { marginBottom: '6px', fontStyle: 'italic', fontSize: '13px' } }>
							<strong>{ token }:</strong>{ ' ' }{ desc }
						</div>
					) ) }
				</div>,
				document.body
			) }
		</div>
	);
};

export default ShowMore;
