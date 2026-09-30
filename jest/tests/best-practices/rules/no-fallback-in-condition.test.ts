import ruleTester from '../../../helpers/rule-tester';
import noFallbackInConditionRule from '../../../../plugins/best-practices/rules/no-fallback-in-condition';


describe( 'no-fallback-in-condition', () => {
	ruleTester.run( 'no-fallback-in-condition', noFallbackInConditionRule, {
		valid: [
			{
				code: 'const page = args.page ?? 1; if ( page > 1 ) {}',
			},
			{
				code: 'const label = active ? \'on\' : \'off\';',
			},
			{
				code: 'if ( 1 < page ) { page = args.page ?? 1; }',
			},
			{
				code: 'if ( 1 < page ) {} else { label = active ? \'on\' : \'off\'; }',
			},
			{
				code: 'const label = 1 < page ? ( args.page ?? 1 ) : 0;',
			},
			{
				code: 'const label = active ? \'on\' : ( ready ? \'ready\' : \'off\' );',
			},
			{
				code: 'if ( a || b ) {}',
			},
			{
				code: 'if ( a && b ) {}',
			},
			{
				code: 'for ( let i = start ?? 0; i < 10; i++ ) {}',
			},
			{
				code: 'for ( let i = 0; i < 10; i = i + ( step ?? 1 ) ) {}',
			},
			{
				code: 'while ( running ) { page = args.page ?? 1; }',
			},
			{
				code: 'switch ( args.page ?? 1 ) { case 1: break; }',
			},
			{
				code: 'items.forEach( item => { if ( item.active ) { item.page = item.page ?? 1; } } );',
			},
		],
		invalid: [
			{
				code: 'if ( ( state.threadsData.queryArgs.page ?? 1 ) > 1 ) {}',
				errors: [
					{messageId: 'nullish', column: 8, endColumn: 45},
				],
			},
			{
				code: 'if ( args.page ?? 1 ) {}',
				errors: [
					{messageId: 'nullish', column: 6, endColumn: 20},
				],
			},
			{
				code: 'if ( active ? a : b ) {}',
				errors: [
					{messageId: 'ternary', column: 6, endColumn: 20},
				],
			},
			{
				code: 'if ( 1 < ( active ? a : b ) ) {}',
				errors: [
					{messageId: 'ternary', column: 12, endColumn: 26},
				],
			},
			{
				code: 'if ( ready ) {} else if ( ( args.page ?? 1 ) > 1 ) {}',
				errors: [
					{messageId: 'nullish', column: 29, endColumn: 43},
				],
			},
			{
				code: 'while ( ( args.page ?? 1 ) > 1 ) {}',
				errors: [
					{messageId: 'nullish', column: 11, endColumn: 25},
				],
			},
			{
				code: 'do {} while ( active ? a : b );',
				errors: [
					{messageId: 'ternary', column: 15, endColumn: 29},
				],
			},
			{
				code: 'for ( let i = 0; i < ( max ?? 10 ); i++ ) {}',
				errors: [
					{messageId: 'nullish', column: 24, endColumn: 33},
				],
			},
			{
				code: 'const label = ( args.page ?? 1 ) > 1 ? \'more\' : \'first\';',
				errors: [
					{messageId: 'nullish', column: 17, endColumn: 31},
				],
			},
			{
				code: 'const label = ( active ? a : b ) ? \'on\' : \'off\';',
				errors: [
					{messageId: 'ternary', column: 17, endColumn: 31},
				],
			},
			{
				code: 'if ( items.some( item => item.page ?? false ) ) {}',
				errors: [
					{messageId: 'nullish', column: 26, endColumn: 44},
				],
			},
			{
				code: 'if ( items.some( function( item ) { return item.active ? a : b; } ) ) {}',
				errors: [
					{messageId: 'ternary', column: 44, endColumn: 63},
				],
			},
			{
				code: 'if ( items.some( item => { const page = item.page ?? 1; return 1 < page; } ) ) {}',
				errors: [
					{messageId: 'nullish', column: 41, endColumn: 55},
				],
			},
			{
				code: 'if ( ( a ?? b ) && ( c ? d : e ) ) {}',
				errors: [
					{messageId: 'nullish', column: 8, endColumn: 14},
					{messageId: 'ternary', column: 22, endColumn: 31},
				],
			},
			{
				code: 'if ( a ) { if ( b ?? c ) {} }',
				errors: [
					{messageId: 'nullish', column: 17, endColumn: 23},
				],
			},
		],
	} );
} );
