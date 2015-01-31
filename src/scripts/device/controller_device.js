'use strict';

carcloudApp.controller('DeviceListController',
                       function ($modal, $scope, $q, resolvedDevice, Device, User) {

                           $scope.devices = resolvedDevice;

                           $scope.selected = undefined;

                           $scope.openAddDeviceModal = function () {
                               $modal.open({
                                               templateUrl: 'templates/devices-add.html',
                                               controller: 'DeviceAddController',
                                               resolve: {
                                                   $parentScope: function () {
                                                       return $scope;
                                                   }
                                               }
                                           });
                           };

                           $scope.openEditDeviceModal = function (id) {
                               $modal.open({
                                               templateUrl: 'templates/devices-edit.html',
                                               controller: 'DeviceEditController',
                                               resolve: {
                                                   $parentScope: function () {
                                                       return $scope;
                                                   },
                                                   resolvedDevice: function (Device) {
                                                       return Device.get({id: id});
                                                   }
                                               }
                                           });
                           };

                           $scope.openOwnersDeviceModal = function (id) {
                               $modal.open({
                                               templateUrl: 'templates/devices-owners.html',
                                               controller: 'DeviceOwnersController',
                                               resolve: {
                                                   $parentScope: function () {
                                                       return $scope;
                                                   },
                                                   resolvedDevice: function (Device, $q) {
                                                       var deferred = $q.defer();

                                                       Device.get({'id': id}, function (device) {
                                                           device.resource("owners").get().$promise.then(function (owners) {
                                                               device.owners = owners;
                                                               deferred.resolve(device);
                                                           });
                                                       });

                                                       return deferred.promise;
                                                   }
                                               }
                                           });
                           };

                           $scope.delete = function (id) {
                               Device.delete({id: id}, function () {
                                   delete $scope.devices[id];
                               });
                           };
                       });

carcloudApp.controller('DeviceController', function ($scope, resolvedDevice) {

    $scope.device = resolvedDevice;

    var mapOptions = {
        zoom: 8
    };

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];

    var polyLineCoordinates = [];

    var infoWindow = new google.maps.InfoWindow({maxWidth: 300});

    var createMarker = function (track){

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(track.latitude, track.longitude),
            title: 'Track ' + track.id
        });
        polyLineCoordinates.push(marker.position);

        marker.content = '<div class="infoWindowContent"><table><tr><th>Name</th><th>Value</th></tr>';

        angular.forEach(track.fields, function(field) {
           marker.content = marker.content + '<tr><td>' + field.name + '</td><td>' + field.value +'</td></tr>';
        });

        marker.content = marker.content + '</table></div>';
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);

    };

    angular.forEach(resolvedDevice.tracks, function (track) {
        createMarker(track);
    });

    $scope.map.setCenter($scope.markers[Math.round(($scope.markers.length - 1) / 2)].position);

    var path = new google.maps.Polyline({
       path: polyLineCoordinates
    });
    path.setMap($scope.map);

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
});

carcloudApp.controller('DeviceAddController',
                       function ($scope, $parentScope, $modalInstance, Device) {
                           $scope.create = function () {
                               Device.save($scope.device,
                                           function () {
                                               Device.query().$promise.then(function (devices) {
                                                   angular.forEach(devices, function (device) {
                                                       if (!$parentScope.devices[device.id]) {
                                                           $parentScope.devices[device.id] = device;
                                                       }
                                                   });
                                               });
                                               $modalInstance.close();
                                           });
                           };

                           $scope.cancel = function () {
                               $modalInstance.dismiss('cancel');
                           };
                       });

carcloudApp.controller('DeviceEditController',
                       function ($scope, $parentScope, $modalInstance, Device, resolvedDevice) {

                           $scope.device = resolvedDevice;

                           $scope.update = function () {
                               Device.update($scope.device,
                                             function () {
                                                 $parentScope.devices[$scope.device.id] =
                                                 $scope.device;
                                                 $modalInstance.close();
                                             });
                           };

                           $scope.cancel = function () {
                               $modalInstance.dismiss('cancel');
                           };
                       });

carcloudApp.controller('DeviceOwnersController',
                       function ($scope, $parentScope, $modalInstance, Device, User,
                                 resolvedDevice) {

                           $scope.device = resolvedDevice;

                           $scope.cancel = function () {
                               $modalInstance.dismiss('cancel');
                           };

                           $scope.getUsers = function (username) {
                               return User.get({'username': username}).$promise;
                           };

                           $scope.addOwner = function () {
                               resolvedDevice.resource("owners").save($scope.usernameSelected,
                                                                      function () {

                                                                          $scope.device.resource("owners").get().$promise.then(function (owners) {
                                                                              angular.forEach(owners,
                                                                                              function (value,
                                                                                                        key) {
                                                                                                  if (!$scope.device.owners[key]) {
                                                                                                      console.log("adding "
                                                                                                                  + key);
                                                                                                      $scope.device.owners[key] =
                                                                                                      value;
                                                                                                  }
                                                                                              });
                                                                              $scope.usernameSelected =
                                                                              undefined;
                                                                          });

                                                                      });
                           };

                           $scope.removeOwner = function (username) {
                               $scope.device.resource("owners").delete({id: username}).$promise.then(function (success) {
                                   delete $scope.device.owners[username];
                               });
                           }
                       });
