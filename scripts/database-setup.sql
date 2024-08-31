-- EPOCH TO TIMESTAMP
create or replace function epoch_to_timestamp(epoch text) returns timestamp with time zone as $$ begin return timestamp with time zone 'epoch' + ((epoch::bigint) / 1000) * interval '1 second';
end;
$$ language plpgsql;

create or replace function timestamp_to_epoch(ts timestamp with time zone) returns bigint as $$ begin return (
        extract(
            epoch
            from ts
        ) * 1000
    )::bigint;
end;
$$ language plpgsql;

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create a custom type for note types
CREATE TYPE note_type AS ENUM ('regular', 'daily');

-- Index for faster queries
CREATE INDEX idx_notes_date ON notes(date);
CREATE INDEX idx_messages_note_id ON messages(note_id);

-- CREATE/UPDATE NOTES AND MESSAGES
-- Function to create a new note
CREATE OR REPLACE FUNCTION public.create_note(
    p_id UUID,
    p_user_id UUID,
    p_title TEXT,
    p_note_type public.note_type,
    p_date timestamp with time zone,
    p_created_at timestamp with time zone,
    p_updated_at timestamp with time zone
) RETURNS UUID AS $$
DECLARE
    v_existing_id UUID;
BEGIN
    -- Check if a daily note already exists for this date and user
    IF p_note_type = 'daily' THEN
        SELECT id INTO v_existing_id
        FROM public.notes
        WHERE user_id = p_user_id AND date = p_date::date AND note_type = 'daily' AND deleted_at IS NULL;
        
        IF v_existing_id IS NOT NULL THEN
            -- Update the existing daily note
            UPDATE public.notes
            SET
                title = p_title,
                updated_at = p_updated_at,
                last_modified_at = NOW()
            WHERE id = v_existing_id;
            
            RETURN v_existing_id;
        END IF;
    END IF;

    -- Create a new note
    INSERT INTO public.notes (
        id,
        user_id,
        title,
        note_type,
        date,
        created_at,
        updated_at,
        server_created_at,
        last_modified_at
    ) VALUES (
        p_id,
        p_user_id,
        p_title,
        p_note_type,
        p_date,
        p_created_at,
        p_updated_at,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE
    SET
        title = EXCLUDED.title,
        note_type = EXCLUDED.note_type,
        date = EXCLUDED.date,
        updated_at = EXCLUDED.updated_at,
        last_modified_at = NOW();

    RETURN p_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update an existing note
CREATE OR REPLACE FUNCTION public.update_note(
    p_id UUID,
    p_title TEXT,
    p_note_type public.note_type,
    p_date timestamp with time zone,
    p_updated_at timestamp with time zone
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notes
    SET
        title = p_title,
        note_type = p_note_type,
        date = p_date,
        updated_at = p_updated_at,
        last_modified_at = NOW()
    WHERE id = p_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new message
CREATE OR REPLACE FUNCTION public.create_message(
    p_id UUID,
    p_note_id UUID,
    p_user_id UUID,
    p_content TEXT,
    p_created_at timestamp with time zone,
    p_updated_at timestamp with time zone
) RETURNS UUID AS $$
BEGIN
    INSERT INTO public.messages (
        id,
        note_id,
        user_id,
        content,
        created_at,
        updated_at,
        server_created_at,
        last_modified_at
    ) VALUES (
        p_id,
        p_note_id,
        p_user_id,
        p_content,
        p_created_at,
        p_updated_at,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE
    SET
        note_id = EXCLUDED.note_id,
        user_id = EXCLUDED.user_id,
        content = EXCLUDED.content,
        updated_at = EXCLUDED.updated_at,
        last_modified_at = NOW();

    RETURN p_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update an existing message
CREATE OR REPLACE FUNCTION public.update_message(
    p_id UUID,
    p_content TEXT,
    p_updated_at timestamp with time zone
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.messages
    SET
        content = p_content,
        updated_at = p_updated_at,
        last_modified_at = NOW()
    WHERE id = p_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- PULL FUNCTION
CREATE OR REPLACE FUNCTION public.pull(last_pulled_at bigint DEFAULT 0, p_user_id uuid DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
    _ts timestamp with time zone;
    _notes jsonb;
    _messages jsonb;
BEGIN
    -- Convert timestamp
    _ts := to_timestamp(last_pulled_at / 1000);

    -- Notes
    SELECT jsonb_build_object(
        'created', '[]'::jsonb,
        'updated',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', n.id,
                    'user_id', n.user_id,
                    'title', n.title,
                    'note_type', n.note_type,
                    'date', timestamp_to_epoch(n.date),
                    'created_at', timestamp_to_epoch(n.created_at),
                    'updated_at', timestamp_to_epoch(n.updated_at)
                )
            ) FILTER (WHERE n.deleted_at IS NULL AND n.last_modified_at > _ts),
            '[]'::jsonb
        ),
        'deleted',
        COALESCE(
            jsonb_agg(to_jsonb(n.id)) FILTER (WHERE n.deleted_at IS NOT NULL AND n.last_modified_at > _ts),
            '[]'::jsonb
        )
    ) INTO _notes
    FROM notes n
    WHERE (n.user_id = p_user_id); -- this is where we do user_id check instead of in the FILTER

    -- Messages
    SELECT jsonb_build_object(
        'created', '[]'::jsonb,
        'updated',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', m.id,
                    'note_id', m.note_id,
                    'user_id', m.user_id,
                    'content', m.content,
                    'created_at', timestamp_to_epoch(m.created_at),
                    'updated_at', timestamp_to_epoch(m.updated_at)
                )
            ) FILTER (WHERE m.deleted_at IS NULL AND m.last_modified_at > _ts),
            '[]'::jsonb
        ),
        'deleted',
        COALESCE(
            jsonb_agg(to_jsonb(m.id)) FILTER (WHERE m.deleted_at IS NOT NULL AND m.last_modified_at > _ts),
            '[]'::jsonb
        )
    ) INTO _messages
    FROM messages m
    JOIN notes n ON m.note_id = n.id
    WHERE (n.user_id = p_user_id);

    RETURN jsonb_build_object(
        'changes',
        jsonb_build_object(
            'notes', _notes,
            'messages', _messages
        ),
        'timestamp', timestamp_to_epoch(now())
    );
END;
$$ LANGUAGE plpgsql;

-- Push function to handle synchronization
CREATE OR REPLACE FUNCTION push(changes jsonb) RETURNS void AS $$
DECLARE
    new_note jsonb;
    updated_note jsonb;
    new_message jsonb;
    updated_message jsonb;
BEGIN
    -- Insert new notes
    FOR new_note IN SELECT jsonb_array_elements((changes->'notes'->'created'))
    LOOP
        PERFORM create_note(
            (new_note->>'id')::uuid,
            (new_note->>'user_id')::uuid,
            new_note->>'title',
            (new_note->>'note_type')::public.note_type,
            epoch_to_timestamp(new_note->>'date'),
            epoch_to_timestamp(new_note->>'created_at'),
            epoch_to_timestamp(new_note->>'updated_at')
        );
    END LOOP;

    -- Delete notes
    WITH changes_data AS (
        SELECT jsonb_array_elements_text(changes->'notes'->'deleted')::uuid AS deleted
    )
    UPDATE public.notes
    SET deleted_at = now(),
        last_modified_at = now()
    FROM changes_data
    WHERE notes.id = changes_data.deleted;

    -- Update notes
    FOR updated_note IN SELECT jsonb_array_elements((changes->'notes'->'updated'))
    LOOP
        PERFORM update_note(
            (updated_note->>'id')::uuid,
            updated_note->>'title',
            (updated_note->>'note_type')::public.note_type,
            epoch_to_timestamp(updated_note->>'date'),
            epoch_to_timestamp(updated_note->>'updated_at')
        );
    END LOOP;

    -- Insert new messages
    FOR new_message IN SELECT jsonb_array_elements((changes->'messages'->'created'))
    LOOP
        PERFORM create_message(
            (new_message->>'id')::uuid,
            (new_message->>'note_id')::uuid,
            (new_message->>'user_id')::uuid,
            new_message->>'content',
            epoch_to_timestamp(new_message->>'created_at'),
            epoch_to_timestamp(new_message->>'updated_at')
        );
    END LOOP;

    -- Delete messages
    WITH changes_data AS (
        SELECT jsonb_array_elements_text(changes->'messages'->'deleted')::uuid AS deleted
    )
    UPDATE public.messages
    SET deleted_at = now(),
        last_modified_at = now()
    FROM changes_data
    WHERE messages.id = changes_data.deleted;

    -- Update messages
    FOR updated_message IN SELECT jsonb_array_elements((changes->'messages'->'updated'))
    LOOP
        PERFORM update_message(
            (updated_message->>'id')::uuid,
            updated_message->>'content',
            epoch_to_timestamp(updated_message->>'updated_at')
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
