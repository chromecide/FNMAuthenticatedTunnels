var mixinFunctions = {
	init: function(){
		var thisNode = this;
		
		
		//add properties that are needed by this mixin
	
		//add Events that are emitted by this mixin
		
		
		//if it isn't already, we need to mixin the FNMGroupSecurity
		if(!thisNode.FNMGroupSecurity_Settings){
			thisNode.mixin('FNMGroupSecurity', {}, function(){
				
			});	
		}
		
		thisNode.TunnelManager.configureManager({
			allowed: function(action, tunnel, topic, message){
				if(!tunnel.isLoggedIn){
					tunnel.isLoggedIn = false;
				}
				var isAllowed = true;
				if(action=='recieve'){
					switch(topic){
						case 'init':
							//leave well enough alonel
							break;
						case 'FNMAuthenticatedTunnels.Login': //the other end is attempting to login
							return true;
							break;
						case 'FNMAuthenticatedTunnels.Logout': //the other end is attempting to login
							return true;
							break;
						default:
							if(!tunnel.isLoggedIn){
								thisNode.TunnelManager.send(tunnel, 'MustLogin', {message: 'This server requires authentication, please log in.'})
							}
							return tunnel.isLoggedIn;
							break;
					}
				}
				return isAllowed;
			}
		});
		
		thisNode.on('FNMAuthenticatedTunnels.Login', function(message, rawMessage){
			console.log('Security Auth Recieved');
			console.log(message);
			
			thisNode.StorageManager.findOne(message, thisNode.FNMGroupSecurity_Settings.store, thisNode.FNMGroupSecurity_Settings.userChannel, function(err, recs){
				if(!err){
					if(recs.length>0){
						thisNode.TunnelManager.getTunnel(rawMessage._message.sender).isLoggedIn = true;
						thisNode.sendEvent(rawMessage._message.sender, 'FNMAuthenticatedTunnels.LoginSuccessful', {name: recs[0].name});
					}else{
						thisNode.sendEvent(rawMessage._message.sender, 'FNMAuthenticatedTunnels.LoginFailed', {});
					}
				}
			});
		});
	}
}

if (typeof define === 'function' && define.amd) {
	define(mixinFunctions);
} else {
	module.exports = mixinFunctions;
}
	