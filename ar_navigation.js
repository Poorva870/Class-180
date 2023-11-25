let coordinates = {}

$(document).ready(function () {
    get_coordinates();
    render_elements();
})

function get_coordinates() {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('source') && searchParams.has('destination')) {
        let source = searchParams.get('source')
        let destination = searchParams.get('destination')
        coordinates.source_lat = source.split(";")[0]
        coordinates.source_lon = source.split(";")[1]
        coordinates.destination_lat = destination.split(";")[0]
        coordinates.destination_lon = destination.split(";")[1]
    } else {
        alert("Coordinates not selected!")
        window.history.back();
    }
}

function render_elements() {
    //https://obj.whitehatjr.com/45e69d29-2135-49df-89b7-c7d49f43a022.pdf
    // %2C represents the comma
    // %3B respresnts the semi-clon

   $.ajax({
    url: `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.source_lon}%2C${coordinates.source_lat}%3B${coordinates.destination_lon}%2C${coordinates.destination_lat}?alternatives=true&geometries=polyline&steps=true&access_token=pk.eyJ1Ijoib3BoaWxpYSIsImEiOiJjbHBlMWt4ajgxOHc4MmxxcmJ6ODM1ZDZpIn0.12C861IbwGKH3UIuA8Oy5w`,
    type: "get",
    success: function(response){
        var images = {
            "turn_left": "ar_left.png",
            "turn_right": "ar_right.png",
            "slight_left": "ar_slight_left.png",
            "slight_right": "ar_slight_right.png",
            "start": "ar_start.png",
            "straight": "ar_straight.png"
        }
        var steps = response.routes[0].legs[90].steps;
        for(var i=0; i<steps.length; i++){
            var image;
            var distance = steps[i].distance
            var instruction = steps[i].maneuver.instruction
            if (instruction.includes('Turn right')){
                image =  "turn_right"
            }else if(instruction.includes("Turn Left")){
                image = "turn_left"
            }
            if(i>0){
                $("#scene_container").append(
                    `
                    <a-entity gps-entity-place="latitude: ${steps[i].maneuver.location[1]}; longitude: ${steps[i].maneuver.location[0]};">
                    <a-image
                        id = "step_${i}"
                        name = "${instruction}"
                        scale="5 5 5"
                        look-at="step_${i-1}"
                        src = "assets/${images[image]}"
                        position="0 0 0"
                    ></a-image>
                    </a-entity>
                    `
                )
            }
            else{
                $("#scene_container").append(
                    `
                        <a-entity gps-entity-place="latitude: ${steps[i].maneuver.location[1]}; longitude: ${steps[i].maneuver.location[0]};">
                            <a-image 
                                name="${instruction}"
                                src="./assets/ar_start.png"
                                look-at="#step_${i + 1}"
                                scale="5 5 5"
                                id="step_${i}"
                                position="0 0 0"
                            >
                            </a-image>
                            <a-entity>
                                <a-text height="50" value="${instruction} (${distance}m)"></a-text>
                            </a-entity>
                        </a-entity>
                    `
                )
            }
        }

    }
   })
}
