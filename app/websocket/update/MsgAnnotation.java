/*
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package websocket.update;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicInteger;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.apache.juli.logging.Log;
import org.apache.juli.logging.LogFactory;
 
/*
 * The application is deployed under the /supplies context, therefore this
 * endpoint is available to clients as wss://eis.nmu.ac.th/supplies/websocket/event.
 */
@ServerEndpoint(
        value = "/websocket/event",
        configurator = ServletAwareConfigurator.class
)
public class MsgAnnotation {

    private static final Log log = LogFactory.getLog(MsgAnnotation.class);

    private static final String GUEST_PREFIX = "Guest";
    private static final AtomicInteger connectionIds = new AtomicInteger(0);
    private static final Set<MsgAnnotation> connections =
            new CopyOnWriteArraySet<>();

    private final String nickname;
    private Session session;

    public MsgAnnotation() {
        nickname = GUEST_PREFIX + connectionIds.getAndIncrement();
    }


    @OnOpen
    public void start(Session session) {
        this.session = session;
        connections.add(this);
 
 String msg = String.format("{"
                    + "\"type\":\"%s\","
                    + "\"status\":\"%s\","
                    + "\"socket\":\"%s\","
                    + "\"id\":\"%s\","
                    + "\"name\":\"%s\","
                    + "\"message\":\"%s\","
                    + "\"msgText\":\"%s\","
                    + "\"datetime\":\"%s\""
                    + "}",
                    "system",
                    "connect",
                    this.session.getId(),
                    "0 TV",
                    "TV NAME",
                    this.session.getId()+" tv connected",
                    this.session.getId()+" tv connected",
                    null 
 );                    
        String message = String.format(msg);
        broadcast(message);
    }


    @OnClose
    public void end() {
        connections.remove(this);
        String message = String.format("%s", "{\"type\":\"server\"}");
        broadcast(message);
    }
 
    @OnMessage
    public void incoming(String message) {
        if (message == null || message.length() == 0) {
            return;
        }

        // Protect the server from accidentally broadcasting an unbounded frame.
        // The payload remains unchanged so existing JSON event clients continue
        // to work without a protocol migration.
        if (message.length() > 65536) {
            log.warn("Rejected oversized WebSocket event from session " + session.getId());
            return;
        }
        broadcast(message);
    }




    @OnError
    public void onError(Throwable t) throws Throwable {
        log.error("Chat Error: " + t.toString(), t);
    }


    private static void broadcast(String msg) {
        for (MsgAnnotation client : connections) {
            if (client.session == null || !client.session.isOpen()) {
                connections.remove(client);
                continue;
            }
            try {
                synchronized (client) {
                    client.session.getBasicRemote().sendText(msg);
                }
            } catch (IOException e) {
                log.debug("Chat Error: Failed to send message to client", e);
                connections.remove(client);
                try {
                    client.session.close();
                } catch (IOException e1) {
                    // Ignore
                }
            }
        }
    }
}
