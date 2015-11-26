// Global
var isDragging = false;

// Show search
function showSearch() {
	$("#controls").css({"visibility": "hidden"});
	$("#search-icon").hide();
	$("#search-close-icon").show();
	$("#search-query").css("width", "250px");
}

// Hide search
function hideSearch() {
	$("#search-close-icon").hide();
	$("#search-icon").show();
	$("#search-query").css("width", "0");
	$("#controls").css({"visibility": "visible"});
}

// Search component
var Search = React.createClass({
	componentDidMount: function() {
		var self = this;

		$("#search-form").submit(function(e) {
			// Prevent page refresh due to form submit
			e.preventDefault();

			// Get tracks
			self.props.getTracks($("#search-query").val());
		});

		// Handle enter key
		$("#search-query").keypress(function(e) {
			if(e.which === 13 || e.keyCode === 13)
				self.props.getTracks($(this).val());
		});
	},

	render: function() {
		return (
			<div id="search">
				<div id="search-icon" onClick={showSearch}><span></span></div>
				<div id="search-close-icon" onClick={hideSearch}><span></span></div>
				<form id="search-form" action="">
					<input type="text" id="search-query" placeholder="Soundcloud username" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
					<input type="submit" id="submit-search" value="" />
				</form>
			</div>
		);
	}
});

var Controls = React.createClass({
	render: function() {
		// Handle play/pause button
		var playPause = (function() {
			if(this.props.isPlaying)
				return (
					<div id="pause" className={this.props.currentTrack.index === -1 ? "disabled" : ""} onClick={this.props.pause}><span></span></div>
				);
			else
				return (
					<div id="play" className={this.props.currentTrack.index === -1 ? "disabled" : ""} onClick={this.props.play}><span></span></div>
				);
		}.bind(this))();

		return (
			<div id="controls">
				<div id="skip-prev" className={this.props.currentTrack.index === -1 ? "disabled" : ""} onClick={this.props.skipPrev}><span></span></div>
				{playPause}
				<div id="skip-next" className={this.props.nextTrack === -1 ? "disabled" : ""} onClick={this.props.skipNext}><span></span></div>
				<div id="replay" className={!this.props.replay ? "disabled" : ""} onClick={this.props.toggleReplay}><span></span><span></span><span></span><span></span><span>1</span></div>
			</div>
		);
	}
});

var Info = React.createClass({
	componentDidMount: function() {
		var self = this;

		// Handle updating time and info based on drag and click events
		var setTimeFromEvent = function(e) {
			var width = $("#progress").width(),
				x = e.pageX - $("#progress").offset().left;

			// If we're out of bounds
			if(x < 0) x = 0;
			if(x > width) x = width;

			// Get time based on tracker position
			var time = x / width * self.props.currentTrack.track.duration;

			// Set the info time and progress-bar, tracker position
			$("#current-time").text(msToTime(time));
			$("#progress-bar").css({"width": x + "px"});
			$("#tracker").css({"left": x + "px"});

			return time;
		}

		// Make tracker draggable
		$("#tracker").mousedown(function(e) {
			// If a track isn't on deck
			if(self.props.currentTrack.index === -1)
				return;

			isDragging = true;

			// Store track time in this scope
			var time;

			var handleDragging = function(e) {
				time = setTimeFromEvent(e);
			};

			var handleMouseUp = function(e) {
				isDragging = false;

				// Set track time
				self.props.setTime(time / 1000);

				$(document)
				.off("mousemove", handleDragging)
				.off("mouseup", handleMouseUp);
			};

			$(document)
			.on("mousemove", handleDragging)
			.on("mouseup", handleMouseUp);
		});

		// Handle clicks on progress
		$("#progress").click(function(e) {
			// If a track isn't on deck
			if(self.props.currentTrack.index === -1)
				return;

			// Set track time
			self.props.setTime(setTimeFromEvent(e) / 1000);
		});
	},

	render: function() {
		// Create div elements for rendering cube
		var Cube = (function() {
			return (
				<div id="cube">
					<div id="cube-sides">
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			);
		})();

		// Handle track picture
		var Picture = (function() {
			if(this.props.currentTrack.index === -1)
				return Cube;

			if(this.props.currentTrack.track.artwork_url == "")
				return (
					<div className="no-picture"><span>?</span></div>
				);

			return (
				<img src={this.props.currentTrack.track.artwork_url} alt="" />
			);
		}.bind(this))();

		return (
			<div className="info">
				<div className="picture">
					{Picture}
				</div>

				<div className="track">
					<span className="artist">{this.props.currentTrack.index === -1 ? "" : this.props.currentTrack.track.user.username}</span>
					<span className="title">{this.props.currentTrack.index === -1 ? "Waiting for track..." : this.props.currentTrack.track.title}</span>

					<div className="time">
						<span id="current-time">0:00</span> / <span>{this.props.currentTrack.index === -1 ? "0:00" : msToTime(this.props.currentTrack.track.duration)}</span>
					</div>

					<div id="progress">
						<div id="tracker"></div>
						<div id="progress-buffer-bar"></div>
						<div id="progress-bar"></div>
					</div>
				</div>
			</div>
		);
	}
});

var Player = React.createClass({
	componentDidMount: function() {
		var self = this,
			player = document.getElementById("player");

		// Handle buffering progress
		function handleBuffering() {
			var buffered = player.buffered;

			if(buffered.length) {
				// Get loaded percentage based on last TimeRanges obj from buffered
				var loaded = 100 * buffered.end(buffered.length - 1) / player.duration;

				// Update the buffer progress bar
				$("#progress-buffer-bar").css({"width": loaded + "%"});
			}
		}

		// Handle progress event
		player.addEventListener("progress", handleBuffering);

		// Handle playback progress
		player.addEventListener("timeupdate", function() {
			// Handle buffering
			handleBuffering();

			// If we're currently dragging the tracker
			if(isDragging) return;

			// Update track time
			var time = msToTime(player.currentTime * 1000);
			$("#current-time").text(time);

			// Update progress bar
			var progress = 100 * player.currentTime / player.duration;
			$("#progress-bar").css({"width": progress + "%"});
			$("#tracker").css({"left": progress + "%"});
		});

		// Handle end of playback
		player.addEventListener("ended", function() {
			// Handle replay
			if(self.props.replay) {
				self.props.setTime(0)
				return;
			}

			// Handle autoplay
			if(self.props.nextTrack > -1) {
				self.props.skipNext();
				return;
			}

			self.props.setIsPlaying(false);
		});
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		if(this.props.currentTrack.index === nextProps.currentTrack.index)
			return false;

		return true;
	},

	componentDidUpdate: function() {
		if(this.props.currentTrack.index === -1)
			return;

		this.props.playNew();
	},

	render: function() {
		return (
			<audio id="player" src={this.props.currentTrack.index === -1 ? "" : this.props.currentTrack.track.stream_url}></audio>
		);
	}
});

var Deck = React.createClass({
	getInitialState: function() {
		return {
			isPlaying: false,
			replay: false
		};
	},

	play: function() {
		if(this.props.currentTrack.index === -1)
			return;

		var player = document.getElementById("player");
		player.play();

		this.setState({isPlaying: true});
	},

	playNew: function() {
		if(this.props.currentTrack.index === -1)
			return;

		var player = document.getElementById("player");

		player.pause();

		// Reset progress
		$("#current-time").text("0:00");
		$("#progress-buffer-bar").css({"width": 0});
		$("#progress-bar").css({"width": 0});
		$("#tracker").css({"left": 0});

		player.load();
		player.play();

		this.setState({isPlaying: true});
	},

	pause: function() {
		if(this.props.currentTrack.index === -1)
			return;

		var player = document.getElementById("player");
		player.pause();

		this.setState({isPlaying: false});
	},

	skipPrev: function() {
		if(this.props.currentTrack.index === -1)
			return;

		// Handle 2 second delay
		var player = document.getElementById("player");

		if(player.currentTime >= 2
			|| (player.currentTime < 2 && this.props.prevTrack === -1)) {
			this.setTime(0);
			return;
		}

		this.props.setTrack(this.props.prevTrack);
	},

	skipNext: function() {
		if(this.props.nextTrack === -1)
			return;

		this.props.setTrack(this.props.nextTrack);
	},

	toggleReplay: function() {
		if(this.state.replay)
			this.setState({replay: false});
		else
			this.setState({replay: true});
	},

	setTime: function(time) {
		var player = document.getElementById("player");

		player.currentTime = time;
		player.play();

		this.setState({isPlaying: true});
	},

	setIsPlaying: function(playing) {
		this.setState({isPlaying: playing});
	},

	render: function() {
		return (
			<div id="deck">
				<Controls currentTrack={this.props.currentTrack} prevTrack={this.props.prevTrack} nextTrack={this.props.nextTrack} replay={this.state.replay} isPlaying={this.state.isPlaying} play={this.play} pause={this.pause} skipPrev={this.skipPrev} skipNext={this.skipNext} toggleReplay={this.toggleReplay} />
				<Info currentTrack={this.props.currentTrack} setTime={this.setTime} />
				<Player currentTrack={this.props.currentTrack} nextTrack={this.props.nextTrack} replay={this.state.replay} setIsPlaying={this.setIsPlaying} playNew={this.playNew} skipNext={this.skipNext} setTime={this.setTime} />
			</div>
		);
	}
});

var Header = React.createClass({
	render: function() {
		return (
			<div id="header">
				<div id="header-center">
					<Search getTracks={this.props.getTracks} />
					<Deck currentTrack={this.props.currentTrack} prevTrack={this.props.prevTrack} nextTrack={this.props.nextTrack} setTrack={this.props.setTrack} />
				</div>
			</div>
		);
	}
});

var Track = React.createClass({
	render: function() {
		return (
			<div className="track" onClick={this.props.setTrack.bind(this, this.props.index)}>
				<div className="picture">
					{this.props.track.artwork_url == "" ? <div className="no-picture"><span>No picture</span></div> : <img src={this.props.track.artwork_url} alt="" />}
				</div>

				<div className="info">
					<span className="artist">{this.props.track.user.username}</span>
					<span className="time">{msToTime(this.props.track.duration)}</span>
					<span className="title">{this.props.track.title}</span>
					<span className="plays">{numAddCommas(this.props.track.playback_count)}</span>
				</div>
			</div>
		);
	}
});

var Tracks = React.createClass({
	render: function() {
		// If this is the initial load
		if(!this.props.tracks)
			return (
				<div id="tracks">
					<div id="initial">
						<h1>/Re<span>sounden</span>\</h1>
						Mobile-ready web app to list and play the favorite tracks of any Soundcloud user
					</div>
				</div>
			);

		// If there is an error
		if(this.props.error)
			return (
				<div id="tracks">
					<div id="not-found">
						Could not find this Soundcloud user
					</div>
				</div>
			);

		// If no playlist was found
		if(!this.props.tracks.length)
			return (
				<div id="tracks">
					<div id="not-found">
						No favorites were found for this user
					</div>
				</div>
			);

		// Loop through list of tracks to build rows
		var Rows = this.props.tracks.map(function(track) {
			return (
				<Track setTrack={this.props.setTrack} index={this.props.tracks.indexOf(track)} track={track} />
			);
		}.bind(this));

		return (
			<div id="tracks">
				{Rows}
			</div>
		);
	}
});

var Loading = React.createClass({
	render: function() {
		if(!this.props.loadingTracks)
			return false;

		return (
			<div id="loading">Loading tracks...</div>
		);
	}
});

var Resounden = React.createClass({
	getInitialState: function() {
		return {
			username: "",
			tracks: null,
			nextHref: "",
			currentTrack: {
				index: -1,
				track: {}
			},
			prevTrack: -1,
			nextTrack: -1,
			loadingTracks: false,
			error: false
		};
	},

	getTracks: function(username) {
		if(this.state.loadingTracks)
			return;

		this.setState({loadingTracks: true});

		$("#search-query").blur();

		$.ajax({
			url: "api/v1/playlist/" + username,
			dataType: "json",
			success: function(data) {
				// Handle prevTrack and nextTrack
				var prevTrack = -1,
					nextTrack = -1;

				// If there are tracks to show
				if(data.collection.length) {
					$("#search-query").blur();
					hideSearch();
					window.scrollTo(0, 0);
					nextTrack = 0;
				}

				// Set new state
				this.setState({loadingTracks: false});
				this.setState({error: false});
				this.setState({username: username});
				this.setState({tracks: data.collection});
				this.setState({nextHref: data.next_href});
				this.setState({prevTrack: prevTrack});
				this.setState({nextTrack: nextTrack});
			}.bind(this),
			error: function() {
				// Set new state
				this.setState({loadingTracks: false});
				this.setState({error: true});
				this.setState({username: ""});
				this.setState({tracks: []});
				this.setState({nextHref: ""});
				this.setState({prevTrack: -1});
				this.setState({nextTrack: -1});
			}.bind(this)
		});
	},

	getMoreTracks: function() {
		if(this.state.loadingTracks)
			return;

		this.setState({loadingTracks: true});

		$("#search-query").blur();

		$.ajax({
			url: "api/v1/playlist/" + this.state.username,
			dataType: "json",
			data: {next_href: this.state.nextHref},
			success: function(data) {
				// Set new state
				this.setState({loadingTracks: false});
				this.setState({error: false});

				var tracks = this.state.tracks;

				tracks.push.apply(tracks, data.collection);
				this.setState({tracks: tracks});
				this.setState({nextHref: data.next_href});
			}.bind(this),
			error: function() {
				// Set new state
				this.setState({loadingTracks: false});
				this.setState({error: true});
				this.setState({nextHref: ""});
			}.bind(this)
		});
	},

	setTrack: function(index) {
		// Handle prevTrack and nextTrack
		var prevTrack = -1,
			nextTrack = -1;

		if(index > 0)
			prevTrack = index - 1;
		if(index < this.state.tracks.length - 1)
			nextTrack = index + 1;

		// Get the track
		var track = this.state.tracks[index];

		// Set new state
		var newState = React.addons.update(this.state, {
			currentTrack: {
				index: {$set: this.state.tracks.indexOf(track)},
				track: {$set: track}
			},
			prevTrack: {$set: prevTrack},
			nextTrack: {$set: nextTrack}
		});

		this.setState(newState);
		hideSearch();
	},

	componentDidMount: function() {
		var self = this;

		window.addEventListener("scroll", function() {
			if(self.state.nextHref == "" || self.state.loadingTracks)
				return;

			var scroll = $(window).scrollTop() / ($(document).height() - $(window).height()) * 100;

			if(scroll > 80)
				self.getMoreTracks();
		});
	},

	render: function() {
		return (
			<div id="resounden">
				<Header getTracks={this.getTracks} currentTrack={this.state.currentTrack} prevTrack={this.state.prevTrack} nextTrack={this.state.nextTrack} setTrack={this.setTrack} />
				<Tracks setTrack={this.setTrack} tracks={this.state.tracks} error={this.state.error} />
				<Loading loadingTracks={this.state.loadingTracks} />
			</div>
		);
	}
});

ReactDOM.render(
	<Resounden />,
	document.getElementById("resounden-container")
);