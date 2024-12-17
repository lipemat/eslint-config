<script lang="ts">
	export let size: number = 100; // Diameter of the circle
	export let progress: number = 0; // Progress in percentage
	export let strokeWidth: number = 10; // Width of the stroke
	export let bgColor: string = '#eee'; // Background circle color
	export let progressColor: string = '#007bff'; // Progress circle color

	$: radius = ( size - strokeWidth ) / 2;
	$: circumference = radius * 2 * Math.PI;
	$: offset = circumference - ( ( progress / 100 ) * circumference );
</script>

<style>
	body {
		background: black;
	}
</style>

<style>
	svg {
		display: block;
		margin: 0 auto;
	}
</style>

<svg width={size} height={size}>
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke={bgColor}
		stroke-width={strokeWidth}
	/>
	<circle
		cx={size / 2}
		cy={size / 2}
		r={radius}
		fill="none"
		stroke={progressColor}
		stroke-width={strokeWidth}
		stroke-dasharray={circumference}
		stroke-dashoffset={offset}
		transform={`rotate(-90 ${size / 2} ${size / 2})`}
	/>
	<text
		x="50%"
		y="50%"
		dy=".3em"
		text-anchor="middle"
		font-weight="bold"
		fill={progress > 99 ? progressColor : bgColor}
	>
		{Math.round( progress )}%
	</text>
</svg>

<style>
	circle {
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
		transition: stroke-dashoffset 0.35s;
	}
</style>
