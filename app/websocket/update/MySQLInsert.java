/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package websocket.update;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

/**
 *
 * @author conno
 */
public class MySQLInsert {

    public static void MySQLInsert(HttpServletRequest request, HttpServletResponse response) throws NamingException, ParseException {
        // ข้อมูลสำหรับเชื่อมต่อฐานข้อมูล

        System.out.println("MySQLInsert ========> ");

        // ข้อมูลที่ต้องการบันทึก
        LocalDateTime myDateObj = LocalDateTime.now();
        DateTimeFormatter myFormatObj = DateTimeFormatter.ofPattern("yyyy-mm-dd HH:mm:ss");

        System.out.println(" Time ========> " + myDateObj.format(myFormatObj));
        int bg_year = 2024;
        String cost_code = "0";
        int cost_id = 0;
        String cost_name = "มหาวิทยาลัย-ส่วนกลาง";

        Timestamp timestamp = Timestamp.valueOf(myDateObj); // Convert LocalDateTime to Timestamp

//        int dc_cost_id = 0;
// รับค่าจาก request
        String dcCostIdParam = request.getParameter("dc_cost_id");
        int dc_cost_id = 0; // ค่าเริ่มต้น

        if (dcCostIdParam != null && !dcCostIdParam.isEmpty()) {
            dc_cost_id = Integer.parseInt(dcCostIdParam);
        }
        int dc_department_id = 0;
        int dc_department_type_id = 0;
        String domain = "supplies";
        int i_level = 1;
        String msg = request.getParameter("msg");//"ส่งข้อความแบบไม่บันทึกระบุปลายทาง";
        int msgType = Integer.parseInt(request.getParameter("msgType"));//4;
        String sessId = "";
        int sp_emp_id = 0;
        String typemsg = "connect";
        int user_id = 0;
        String user_name = "System Administrator";
        int useronline = 0;
        int view = 1;

        // SQL สำหรับการเพิ่มข้อมูล
        String sql = "INSERT INTO logs (bg_year, cost_code, cost_id, cost_name, datetime, dc_cost_id, "
                + "dc_department_id, dc_department_type_id, domain, i_level, msg, msgType, sessId, "
                + "sp_emp_id, typemsg, user_id, user_name, useronline, view) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        InitialContext initialContext = new InitialContext();
        DataSource dataSource = (DataSource) initialContext.lookup("java:comp/env/jdbc/MysqlDB");

        try (Connection conn = dataSource.getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {

            // กำหนดค่าให้กับตัวแปรในคำสั่ง SQL
            pstmt.setInt(1, bg_year);
            pstmt.setString(2, cost_code);
            pstmt.setInt(3, cost_id);
            pstmt.setString(4, cost_name);
            pstmt.setTimestamp(5, timestamp);
            pstmt.setInt(6, dc_cost_id);
            pstmt.setInt(7, dc_department_id);
            pstmt.setInt(8, dc_department_type_id);
            pstmt.setString(9, domain);
            pstmt.setInt(10, i_level);
            pstmt.setString(11, msg);
            pstmt.setInt(12, msgType);
            pstmt.setString(13, sessId);
            pstmt.setInt(14, sp_emp_id);
            pstmt.setString(15, typemsg);
            pstmt.setInt(16, user_id);
            pstmt.setString(17, user_name);
            pstmt.setInt(18, useronline);
            pstmt.setInt(19, view);

            // บันทึกข้อมูลลงฐานข้อมูล
            int rowsInserted = pstmt.executeUpdate();
            if (rowsInserted > 0) {
                System.out.println("บันทึกข้อมูลสำเร็จ!");
            }
        } catch (SQLException e) {
            System.out.println("เกิดข้อผิดพลาด: " + e.getMessage());
        }
    }  

}
