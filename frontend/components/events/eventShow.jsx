var React = require('react'),
		GroupEventStore = require('../../stores/groupEventStore'),
		ClientActions = require('../../actions/clientActions'),
		EventMap = require('./map.jsx'),
		CurrentUserState = require('../../mixin/currentUserState'),
		HaversineFormula = require('../../mixin/haversine'),
		UserStore = require('../../stores/userStore');

var EventShow = React.createClass({
	mixins: [CurrentUserState, HaversineFormula],
	getInitialState: function() {
		return {
			groupEvent: GroupEventStore.find(this.props.params.eventId),
			distance: 0
		};
	},
	_calculateDistance: function(position){
		var groupEvent = this.state.groupEvent,
				coords = position.coords;
		var p1 = {
							lat: groupEvent.lat,
							lng: groupEvent.lng
						 },
				p2 = {
							lat: coords.latitude,
							lng: coords.longitude
						 };

		this.setState({ distance: HaversineFormula.getDistance(p1, p2) });
	},
	componentDidMount: function() {
		this.esListener = GroupEventStore.addListener(this._fetchedEvent);
		this._calculateDistance({
			coords: UserStore.currentLocation().coords
		});

		if (!this.state.groupEvent.event_time){
			ClientActions.fetchSingleEvent(this.props.params.eventId, UserStore.currentLocation().timeZone);
		} 
	},
	handleError: function(err) {
		console.log(err);
	},
	toggleEventButton: function() {
		if (!this._alreadyRSVP()){
			if (!this.state.currentUser || !this.props.hasJoinedGroup()){
				return <button onClick={this.joinAndRsvpEvent} className="join">Join and RSVP</button>;
				//this should show the sign in modal
			} else if (this.state.currentUser && this.props.hasJoinedGroup()){
				return <button onClick={this.rsvpEvent} className="join">RSVP</button>;
			}
		} else {
			return <button onClick={this.changeRSVP} className="leave">Change RSVP</button>;
		}
	},
	joinAndRsvpEvent: function(){

	},
	rsvpEvent: function(e){
		if (this.state.currentUser && !this._alreadyRSVP()){
			ClientActions.rsvpEvent(this.state.currentUser.id, this.state.groupEvent.id);
		} else {
			//show a sign in or sign up modal
		}
	},
	changeRSVP: function(){
		if (this.state.currentUser && this._alreadyRSVP()){
			ClientActions.changeRSVP(this.state.currentUser.id, this.state.groupEvent.id);
		}
	},
	_alreadyRSVP: function() {
		if (!this.state.currentUser) return false;
		var groupEvents = this.state.currentUser.joinedEvents;
		for (var i = 0; i < groupEvents.length; i++) {
			if (groupEvents[i].id === this.state.groupEvent.id){
				return true;
			}
		}
		return false;
	},
	_fetchedEvent: function() {
		this.setState({
				groupEvent: GroupEventStore.find(this.props.params.eventId)
			})
	},
	parseTime: function(){
		var parsingTime = this.state.groupEvent.event_time;
		if (!parsingTime) return [0, 0];
		return parsingTime.split(" || ");

	},
	componentWillUnmount: function() {
		if (this.esListener) this.esListener.remove();
	},
	render: function() {
		var groupEvent = this.state.groupEvent;
		var showDistance = this.state.distance ? 
				(<p>Distance away: {this.state.distance} miles</p>) : "";
		var eventTime = this.parseTime();
		return (
			<div className="event-parent">
					<div className="event-details">
						<div id="header">
							<h2>{groupEvent.title}</h2>
						</div>
						<div className="event-sub">
							<div className="event-time-info">
								<div className="date-and-time">
									<h3>{eventTime[0]}</h3>
									<p>{eventTime[1]} - {groupEvent.daysAway} away</p>
								</div>
								<div id="location">
									<h4>{groupEvent.street} <a style={{font: "blue" }} href={"https://maps.google.com/?ll=" + groupEvent.lat + "," + groupEvent.lng}>(map)</a></h4>
									<p>{groupEvent.city}, {groupEvent.state} {groupEvent.zip}</p>
									<p>{showDistance}</p>
								</div>
							</div>
							<div className="event-map">
								{
									!this.state.groupEvent.event_time ? "" :
									<EventMap lat={groupEvent.lat} lng={groupEvent.lng} />
								}
							</div>
						</div>
						<div>
							{groupEvent.description}
						</div>
					</div>
					<div className="rsvp-member">
					<div className="rsvp-buttons">
						<div id="title">Interested?</div>
						<div>{this.toggleEventButton()}</div>
						</div>
						<div className="event-participants">
							{groupEvent.event_users.length} going: 
							<ul className="participant-list">
								{
									groupEvent.event_users.map(function(participant){
										return <li key={participant.id}>{participant.name}</li>;
									})
								}
							</ul>
						</div>
					</div>
			</div>
		);
	}


});

module.exports = EventShow;