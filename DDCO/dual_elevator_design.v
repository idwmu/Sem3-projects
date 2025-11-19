/* dual_elevator_design.v - SEQUENTIAL ASSIGNMENT FIX */
module dual_elevator_controller(
    input clk,
    input reset,
    input [3:0] request_floor,
    input request_up,
    input request_down,
    input [1:0] elevator_select,
    output [3:0] elevator1_floor,
    output [3:0] elevator2_floor,
    output [1:0] elevator1_state,
    output [1:0] elevator2_state,
    output elevator1_door_open,
    output elevator2_door_open
);

    localparam IDLE = 2'b00;
    localparam MOVING_UP = 2'b01;
    localparam MOVING_DOWN = 2'b10;
    localparam DOOR_OPEN = 2'b11;

    // Elevator 1 signals
    reg [3:0] elevator1_current_floor;
    reg [3:0] elevator1_target_floor;
    reg [1:0] elevator1_current_state;
    reg elevator1_door;
    reg elevator1_has_target;
    
    // Elevator 2 signals
    reg [3:0] elevator2_current_floor;
    reg [3:0] elevator2_target_floor;
    reg [1:0] elevator2_current_state;
    reg elevator2_door;
    reg elevator2_has_target;
    
    // Timers
    reg [3:0] door_timer1;
    reg [3:0] door_timer2;
    reg [7:0] move_timer1;
    reg [7:0] move_timer2;
    
    // Request queue
    reg [3:0] request_queue_floor [0:7];
    reg [1:0] request_queue_select [0:7];
    reg [7:0] request_queue_valid;
    reg [2:0] request_queue_assigned [0:7]; // 0=none, 1=E1, 2=E2
    
    // Intermediate assignment signals (computed combinationally)
    reg [2:0] next_assignment [0:7];
    
    function [3:0] calc_distance;
        input [3:0] floor1;
        input [3:0] floor2;
        begin
            calc_distance = (floor1 > floor2) ? (floor1 - floor2) : (floor2 - floor1);
        end
    endfunction
    
    assign elevator1_floor = elevator1_current_floor;
    assign elevator2_floor = elevator2_current_floor;
    assign elevator1_state = elevator1_current_state;
    assign elevator2_state = elevator2_current_state;
    assign elevator1_door_open = elevator1_door;
    assign elevator2_door_open = elevator2_door;

    integer i;
    
    // Combinational assignment logic - runs BEFORE sequential logic
    always @(*) begin
        // Start with current assignments
        for (i = 0; i < 8; i = i + 1) begin
            next_assignment[i] = request_queue_assigned[i];
        end
        
        // E1 gets first priority for new assignments
        if (elevator1_current_state == IDLE && !elevator1_has_target) begin
            for (i = 0; i < 8; i = i + 1) begin
                if (request_queue_valid[i] && next_assignment[i] == 3'd0) begin
                    // Check if E1 should take this request
                    if (request_queue_select[i] == 2'b01) begin
                        // Explicit E1 assignment
                        next_assignment[i] = 3'd1;
                        i = 8; // Take first unassigned request only
                    end else if (request_queue_select[i] == 2'b00) begin
                        // Auto: E1 takes if closer or equal distance
                        if (calc_distance(request_queue_floor[i], elevator1_current_floor) <= 
                            calc_distance(request_queue_floor[i], elevator2_current_floor)) begin
                            next_assignment[i] = 3'd1;
                            i = 8; // Take first unassigned request only
                        end
                    end
                end
            end
        end
        
        // E2 gets second priority (after E1 has marked its choice)
        if (elevator2_current_state == IDLE && !elevator2_has_target) begin
            for (i = 0; i < 8; i = i + 1) begin
                if (request_queue_valid[i] && next_assignment[i] == 3'd0) begin
                    // Check if E2 should take this request
                    if (request_queue_select[i] == 2'b10) begin
                        // Explicit E2 assignment
                        next_assignment[i] = 3'd2;
                        i = 8; // Take first unassigned request only
                    end else if (request_queue_select[i] == 2'b00) begin
                        // Auto: E2 takes if still unassigned
                        next_assignment[i] = 3'd2;
                        i = 8; // Take first unassigned request only
                    end
                end
            end
        end
    end
    
    // Request queue management
    always @(posedge clk or posedge reset) begin
        if (reset) begin
            request_queue_valid <= 8'b0;
            for (i = 0; i < 8; i = i + 1) begin
                request_queue_floor[i] <= 4'd0;
                request_queue_select[i] <= 2'b00;
                request_queue_assigned[i] <= 3'd0;
            end
        end else begin
            // Add new request
            if ((request_up || request_down)) begin
                // Check if not duplicate
                if (!((request_queue_valid[0] && request_queue_floor[0] == request_floor && request_queue_assigned[0] == 0) ||
                      (request_queue_valid[1] && request_queue_floor[1] == request_floor && request_queue_assigned[1] == 0) ||
                      (request_queue_valid[2] && request_queue_floor[2] == request_floor && request_queue_assigned[2] == 0) ||
                      (request_queue_valid[3] && request_queue_floor[3] == request_floor && request_queue_assigned[3] == 0) ||
                      (request_queue_valid[4] && request_queue_floor[4] == request_floor && request_queue_assigned[4] == 0) ||
                      (request_queue_valid[5] && request_queue_floor[5] == request_floor && request_queue_assigned[5] == 0) ||
                      (request_queue_valid[6] && request_queue_floor[6] == request_floor && request_queue_assigned[6] == 0) ||
                      (request_queue_valid[7] && request_queue_floor[7] == request_floor && request_queue_assigned[7] == 0))) begin
                    for (i = 0; i < 8; i = i + 1) begin
                        if (!request_queue_valid[i]) begin
                            request_queue_floor[i] <= request_floor;
                            request_queue_select[i] <= elevator_select;
                            request_queue_valid[i] <= 1'b1;
                            request_queue_assigned[i] <= 3'd0;
                            i = 8;
                        end
                    end
                end
            end
            
            // Update assignments from combinational logic
            for (i = 0; i < 8; i = i + 1) begin
                if (request_queue_valid[i] && request_queue_assigned[i] == 3'd0) begin
                    request_queue_assigned[i] <= next_assignment[i];
                end
            end
            
            // Clear completed requests
            for (i = 0; i < 8; i = i + 1) begin
                if (request_queue_valid[i]) begin
                    if (request_queue_assigned[i] == 3'd1 && 
                        elevator1_current_floor == request_queue_floor[i] &&
                        elevator1_current_state == DOOR_OPEN && door_timer1 == 0) begin
                        request_queue_valid[i] <= 1'b0;
                    end
                    if (request_queue_assigned[i] == 3'd2 && 
                        elevator2_current_floor == request_queue_floor[i] &&
                        elevator2_current_state == DOOR_OPEN && door_timer2 == 0) begin
                        request_queue_valid[i] <= 1'b0;
                    end
                end
            end
        end
    end

    // Elevator 1 FSM
    always @(posedge clk or posedge reset) begin
        if (reset) begin
            elevator1_current_floor <= 4'd0;
            elevator1_target_floor <= 4'd0;
            elevator1_current_state <= IDLE;
            elevator1_door <= 1'b0;
            elevator1_has_target <= 1'b0;
            door_timer1 <= 4'd0;
            move_timer1 <= 8'd0;
        end else begin
            case (elevator1_current_state)
                IDLE: begin
                    elevator1_door <= 1'b0;
                    move_timer1 <= 8'd2;
                    elevator1_has_target <= 1'b0;
                    
                    // Check for newly assigned request (uses next_assignment from combinational)
                    for (i = 0; i < 8; i = i + 1) begin
                        if (request_queue_valid[i] && next_assignment[i] == 3'd1 && !elevator1_has_target) begin
                            elevator1_target_floor <= request_queue_floor[i];
                            elevator1_has_target <= 1'b1;
                            
                            if (request_queue_floor[i] > elevator1_current_floor) begin
                                elevator1_current_state <= MOVING_UP;
                            end else if (request_queue_floor[i] < elevator1_current_floor) begin
                                elevator1_current_state <= MOVING_DOWN;
                            end else begin
                                elevator1_current_state <= DOOR_OPEN;
                                door_timer1 <= 4'd5;
                            end
                            i = 8; // Exit loop
                        end
                    end
                end
                
                MOVING_UP: begin
                    if (move_timer1 > 0) begin
                        move_timer1 <= move_timer1 - 1'b1;
                    end else begin
                        if (elevator1_current_floor == elevator1_target_floor ||
                            (request_queue_valid[0] && request_queue_assigned[0] == 3'd1 && request_queue_floor[0] == elevator1_current_floor) ||
                            (request_queue_valid[1] && request_queue_assigned[1] == 3'd1 && request_queue_floor[1] == elevator1_current_floor) ||
                            (request_queue_valid[2] && request_queue_assigned[2] == 3'd1 && request_queue_floor[2] == elevator1_current_floor) ||
                            (request_queue_valid[3] && request_queue_assigned[3] == 3'd1 && request_queue_floor[3] == elevator1_current_floor) ||
                            (request_queue_valid[4] && request_queue_assigned[4] == 3'd1 && request_queue_floor[4] == elevator1_current_floor) ||
                            (request_queue_valid[5] && request_queue_assigned[5] == 3'd1 && request_queue_floor[5] == elevator1_current_floor) ||
                            (request_queue_valid[6] && request_queue_assigned[6] == 3'd1 && request_queue_floor[6] == elevator1_current_floor) ||
                            (request_queue_valid[7] && request_queue_assigned[7] == 3'd1 && request_queue_floor[7] == elevator1_current_floor)) begin
                            elevator1_current_state <= DOOR_OPEN;
                            door_timer1 <= 4'd5;
                        end else if (elevator1_current_floor < elevator1_target_floor) begin
                            elevator1_current_floor <= elevator1_current_floor + 1'b1;
                            move_timer1 <= 8'd2;
                        end else begin
                            elevator1_current_state <= DOOR_OPEN;
                            door_timer1 <= 4'd5;
                        end
                    end
                end
                
                MOVING_DOWN: begin
                    if (move_timer1 > 0) begin
                        move_timer1 <= move_timer1 - 1'b1;
                    end else begin
                        if (elevator1_current_floor == elevator1_target_floor ||
                            (request_queue_valid[0] && request_queue_assigned[0] == 3'd1 && request_queue_floor[0] == elevator1_current_floor) ||
                            (request_queue_valid[1] && request_queue_assigned[1] == 3'd1 && request_queue_floor[1] == elevator1_current_floor) ||
                            (request_queue_valid[2] && request_queue_assigned[2] == 3'd1 && request_queue_floor[2] == elevator1_current_floor) ||
                            (request_queue_valid[3] && request_queue_assigned[3] == 3'd1 && request_queue_floor[3] == elevator1_current_floor) ||
                            (request_queue_valid[4] && request_queue_assigned[4] == 3'd1 && request_queue_floor[4] == elevator1_current_floor) ||
                            (request_queue_valid[5] && request_queue_assigned[5] == 3'd1 && request_queue_floor[5] == elevator1_current_floor) ||
                            (request_queue_valid[6] && request_queue_assigned[6] == 3'd1 && request_queue_floor[6] == elevator1_current_floor) ||
                            (request_queue_valid[7] && request_queue_assigned[7] == 3'd1 && request_queue_floor[7] == elevator1_current_floor)) begin
                            elevator1_current_state <= DOOR_OPEN;
                            door_timer1 <= 4'd5;
                        end else if (elevator1_current_floor > elevator1_target_floor) begin
                            elevator1_current_floor <= elevator1_current_floor - 1'b1;
                            move_timer1 <= 8'd2;
                        end else begin
                            elevator1_current_state <= DOOR_OPEN;
                            door_timer1 <= 4'd5;
                        end
                    end
                end
                
                DOOR_OPEN: begin
                    elevator1_door <= 1'b1;
                    if (door_timer1 > 0) begin
                        door_timer1 <= door_timer1 - 1'b1;
                    end else begin
                        elevator1_door <= 1'b0;
                        elevator1_has_target <= 1'b0;
                        elevator1_current_state <= IDLE;
                    end
                end
            endcase
        end
    end

    // Elevator 2 FSM
    always @(posedge clk or posedge reset) begin
        if (reset) begin
            elevator2_current_floor <= 4'd0;
            elevator2_target_floor <= 4'd0;
            elevator2_current_state <= IDLE;
            elevator2_door <= 1'b0;
            elevator2_has_target <= 1'b0;
            door_timer2 <= 4'd0;
            move_timer2 <= 8'd0;
        end else begin
            case (elevator2_current_state)
                IDLE: begin
                    elevator2_door <= 1'b0;
                    move_timer2 <= 8'd2;
                    elevator2_has_target <= 1'b0;
                    
                    // Check for newly assigned request (uses next_assignment from combinational)
                    for (i = 0; i < 8; i = i + 1) begin
                        if (request_queue_valid[i] && next_assignment[i] == 3'd2 && !elevator2_has_target) begin
                            elevator2_target_floor <= request_queue_floor[i];
                            elevator2_has_target <= 1'b1;
                            
                            if (request_queue_floor[i] > elevator2_current_floor) begin
                                elevator2_current_state <= MOVING_UP;
                            end else if (request_queue_floor[i] < elevator2_current_floor) begin
                                elevator2_current_state <= MOVING_DOWN;
                            end else begin
                                elevator2_current_state <= DOOR_OPEN;
                                door_timer2 <= 4'd5;
                            end
                            i = 8; // Exit loop
                        end
                    end
                end
                
                MOVING_UP: begin
                    if (move_timer2 > 0) begin
                        move_timer2 <= move_timer2 - 1'b1;
                    end else begin
                        if (elevator2_current_floor == elevator2_target_floor ||
                            (request_queue_valid[0] && request_queue_assigned[0] == 3'd2 && request_queue_floor[0] == elevator2_current_floor) ||
                            (request_queue_valid[1] && request_queue_assigned[1] == 3'd2 && request_queue_floor[1] == elevator2_current_floor) ||
                            (request_queue_valid[2] && request_queue_assigned[2] == 3'd2 && request_queue_floor[2] == elevator2_current_floor) ||
                            (request_queue_valid[3] && request_queue_assigned[3] == 3'd2 && request_queue_floor[3] == elevator2_current_floor) ||
                            (request_queue_valid[4] && request_queue_assigned[4] == 3'd2 && request_queue_floor[4] == elevator2_current_floor) ||
                            (request_queue_valid[5] && request_queue_assigned[5] == 3'd2 && request_queue_floor[5] == elevator2_current_floor) ||
                            (request_queue_valid[6] && request_queue_assigned[6] == 3'd2 && request_queue_floor[6] == elevator2_current_floor) ||
                            (request_queue_valid[7] && request_queue_assigned[7] == 3'd2 && request_queue_floor[7] == elevator2_current_floor)) begin
                            elevator2_current_state <= DOOR_OPEN;
                            door_timer2 <= 4'd5;
                        end else if (elevator2_current_floor < elevator2_target_floor) begin
                            elevator2_current_floor <= elevator2_current_floor + 1'b1;
                            move_timer2 <= 8'd2;
                        end else begin
                            elevator2_current_state <= DOOR_OPEN;
                            door_timer2 <= 4'd5;
                        end
                    end
                end
                
                MOVING_DOWN: begin
                    if (move_timer2 > 0) begin
                        move_timer2 <= move_timer2 - 1'b1;
                    end else begin
                        if (elevator2_current_floor == elevator2_target_floor ||
                            (request_queue_valid[0] && request_queue_assigned[0] == 3'd2 && request_queue_floor[0] == elevator2_current_floor) ||
                            (request_queue_valid[1] && request_queue_assigned[1] == 3'd2 && request_queue_floor[1] == elevator2_current_floor) ||
                            (request_queue_valid[2] && request_queue_assigned[2] == 3'd2 && request_queue_floor[2] == elevator2_current_floor) ||
                            (request_queue_valid[3] && request_queue_assigned[3] == 3'd2 && request_queue_floor[3] == elevator2_current_floor) ||
                            (request_queue_valid[4] && request_queue_assigned[4] == 3'd2 && request_queue_floor[4] == elevator2_current_floor) ||
                            (request_queue_valid[5] && request_queue_assigned[5] == 3'd2 && request_queue_floor[5] == elevator2_current_floor) ||
                            (request_queue_valid[6] && request_queue_assigned[6] == 3'd2 && request_queue_floor[6] == elevator2_current_floor) ||
                            (request_queue_valid[7] && request_queue_assigned[7] == 3'd2 && request_queue_floor[7] == elevator2_current_floor)) begin
                            elevator2_current_state <= DOOR_OPEN;
                            door_timer2 <= 4'd5;
                        end else if (elevator2_current_floor > elevator2_target_floor) begin
                            elevator2_current_floor <= elevator2_current_floor - 1'b1;
                            move_timer2 <= 8'd2;
                        end else begin
                            elevator2_current_state <= DOOR_OPEN;
                            door_timer2 <= 4'd5;
                        end
                    end
                end
                
                DOOR_OPEN: begin
                    elevator2_door <= 1'b1;
                    if (door_timer2 > 0) begin
                        door_timer2 <= door_timer2 - 1'b1;
                    end else begin
                        elevator2_door <= 1'b0;
                        elevator2_has_target <= 1'b0;
                        elevator2_current_state <= IDLE;
                    end
                end
            endcase
        end
    end

endmodule