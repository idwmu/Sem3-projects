/* tb_elevator.v - FIXED FOR GTKWAVE */
`timescale 1ns/1ps

module dual_elevator_tb;

    // Testbench signals
    reg clk;
    reg reset;
    reg [3:0] request_floor;
    reg request_up;
    reg request_down;
    reg [1:0] elevator_select;
    
    wire [3:0] elevator1_floor;
    wire [3:0] elevator2_floor;
    wire [1:0] elevator1_state;
    wire [1:0] elevator2_state;
    wire elevator1_door_open;
    wire elevator2_door_open;

    // Debug wires for internal signals
    wire [3:0] debug_e1_current = uut.elevator1_current_floor;
    wire [3:0] debug_e2_current = uut.elevator2_current_floor;
    wire [1:0] debug_e1_state = uut.elevator1_current_state;
    wire [1:0] debug_e2_state = uut.elevator2_current_state;
    wire [3:0] debug_e1_target = uut.elevator1_target_floor;
    wire [3:0] debug_e2_target = uut.elevator2_target_floor;
    wire [3:0] debug_door_timer1 = uut.door_timer1;
    wire [3:0] debug_door_timer2 = uut.door_timer2;
    wire [7:0] debug_move_timer1 = uut.move_timer1;
    wire [7:0] debug_move_timer2 = uut.move_timer2;

    // Instantiate the dual elevator controller
    dual_elevator_controller uut (
        .clk(clk),
        .reset(reset),
        .request_floor(request_floor),
        .request_up(request_up),
        .request_down(request_down),
        .elevator_select(elevator_select),
        .elevator1_floor(elevator1_floor),
        .elevator2_floor(elevator2_floor),
        .elevator1_state(elevator1_state),
        .elevator2_state(elevator2_state),
        .elevator1_door_open(elevator1_door_open),
        .elevator2_door_open(elevator2_door_open)
    );

    // Clock generation (50MHz = 20ns period)
    initial begin
        clk = 0;
        forever #10 clk = ~clk;
    end

    // State names for display
    reg [79:0] state1_name, state2_name;
    always @(*) begin
        case(elevator1_state)
            2'b00: state1_name = "IDLE    ";
            2'b01: state1_name = "MOVING_UP";
            2'b10: state1_name = "MOVING_DN";
            2'b11: state1_name = "DOOR_OPEN";
            default: state1_name = "UNKNOWN ";
        endcase
        
        case(elevator2_state)
            2'b00: state2_name = "IDLE    ";
            2'b01: state2_name = "MOVING_UP";
            2'b10: state2_name = "MOVING_DN";
            2'b11: state2_name = "DOOR_OPEN";
            default: state2_name = "UNKNOWN ";
        endcase
    end

    // Monitoring
    initial begin
        $monitor("Time=%0t | E1: Floor=%0d State=%0s Door=%b | E2: Floor=%0d State=%0s Door=%b | Request: Floor=%0d Up=%b Down=%b Select=%b",
                 $time, elevator1_floor, state1_name, elevator1_door_open,
                 elevator2_floor, state2_name, elevator2_door_open,
                 request_floor, request_up, request_down, elevator_select);
    end

    // VCD dump for waveform viewing - SIMPLE FIX
    initial begin
        $dumpfile("dual_elevator.vcd");
        $dumpvars(0, dual_elevator_tb); // Dump ALL signals
    end

    // Test stimulus
    initial begin
        // Initialize signals
        reset = 1;
        request_floor = 4'd0;
        request_up = 0;
        request_down = 0;
        elevator_select = 2'b00; // Auto selection
        
        $display("\n========================================");
        $display("DUAL ELEVATOR CONTROLLER TESTBENCH");
        $display("========================================\n");
        
        // Release reset
        #50 reset = 0;
        $display("\n[TEST 1] System Reset Complete\n");
        
        // Test 1: Send Elevator 1 to floor 5
        #100;
        $display("\n[TEST 2] Request Elevator 1 to Floor 5\n");
        elevator_select = 2'b01; // Select elevator 1
        request_floor = 4'd5;
        request_up = 1;
        #20 request_up = 0;
        
        // Wait for elevator to reach and complete
        #500;
        
        // Test 2: Send Elevator 2 to floor 3
        $display("\n[TEST 3] Request Elevator 2 to Floor 3\n");
        elevator_select = 2'b10; // Select elevator 2
        request_floor = 4'd3;
        request_up = 1;
        #20 request_up = 0;
        
        // Wait for elevator to reach and complete
        #500;
        
        // Test 3: Send Elevator 1 down to floor 2
        $display("\n[TEST 4] Request Elevator 1 to Floor 2 (Going Down)\n");
        elevator_select = 2'b01; // Select elevator 1
        request_floor = 4'd2;
        request_down = 1;
        #20 request_down = 0;
        
        // Wait for elevator to reach and complete
        #500;
        
        // Test 4: Auto selection - test smart assignment
        $display("\n[TEST 5] Auto Select - Request Floor 7 (E2 should take it - closer)\n");
        elevator_select = 2'b00; // Auto selection
        request_floor = 4'd7;
        request_up = 1;
        #20 request_up = 0;
        
        // Wait for elevator to reach and complete
        #600;
        
        // Test 5: Another auto selection test
        $display("\n[TEST 6] Auto Select - Request Floor 1\n");
        elevator_select = 2'b00; // Auto selection
        request_floor = 4'd1;
        request_up = 1;
        #20 request_up = 0;
        
        #600;
        
        // Test 6: Reset test
        $display("\n[TEST 7] System Reset During Operation\n");
        elevator_select = 2'b01;
        request_floor = 4'd9;
        request_up = 1;
        #20 request_up = 0;
        #100 reset = 1;
        #50 reset = 0;
        
        #200;
        
        // Test 7: Test both elevators with simultaneous requests
        $display("\n[TEST 8] Testing Multiple Requests\n");
        
        // First request
        elevator_select = 2'b01;
        request_floor = 4'd6;
        request_up = 1;
        #20 request_up = 0;
        #200;
        
        // Second request while first is processing
        elevator_select = 2'b10;
        request_floor = 4'd4;
        request_down = 1;
        #20 request_down = 0;
        
        #800;
        
        $display("\n========================================");
        $display("TESTBENCH COMPLETED SUCCESSFULLY");
        $display("========================================\n");
        
        #100 $finish;
    end

    // Timeout watchdog
    initial begin
        #10000;
        $display("\nERROR: Simulation timeout!");
        $finish;
    end

endmodule